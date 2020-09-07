import {ProcessingManager} from 'react-native-video-processing';
import RNFS from 'react-native-fs';
import {StatusBar} from 'react-native';

import database from '@react-native-firebase/database';
import {createThumbnail} from 'react-native-create-thumbnail';
import {assoc, dissoc} from 'ramda';

import {
  getVideoInfo,
  getOpentokVideoInfo,
  getVideoUUID,
  updateVideoSavePath,
} from './pictures';
import {generateID} from './utility';

import {navigate, goBack} from '../../../NavigationService';

import {store} from '../../../reduxStore';
import {sendNewMessage} from './message';
import {enqueueUploadTask} from '../../actions/uploadQueueActions';
import {
  addUserLocalArchive,
  removeUserLocalArchive,
  legacyRemoveUserLocalArchive,
} from '../../actions/localVideoLibraryActions';
import {setArchive, deleteArchive} from '../../actions/archivesActions';

import {
  createCloudVideo,
  setCloudVideoThumbnail,
  claimCloudVideo,
  shareCloudVideo,
  deleteCloudVideo,
} from '../database/firebase/videosManagement';

const generateVideoInfosFromFlags = async (sourceVideoInfo, flags) => {
  if (flags.length > 0) {
    return await Promise.all(
      flags.map(async (flag) => {
        const {startTime, stopTime, thumbnail} = flag;
        const trimOptions = {
          startTime: startTime / 1000,
          endTime: stopTime / 1000,
          saveWithCurrentDate: true,
        };
        const flagVideoUrl = await ProcessingManager.trim(
          sourceVideoInfo.url,
          trimOptions,
        );
        const flagVideoInfo = await getOpentokVideoInfo(flagVideoUrl);
        if (thumbnail) {
          return {...flagVideoInfo, thumbnail};
        } else {
          return flagVideoInfo;
        }
      }),
    );
  } else {
    return [];
  }
};

const arrayUploadFromSnippets = async ({
  flagsSelected,
  recording,
  coachSessionID,
  memberID,
  members,
  userID,
}) => {
  const {id} = recording.fullVideo;
  const sourceVideoInfo = store.getState().archives[id];
  const flags = Object.values(flagsSelected).filter((flag) => {
    return flag?.id !== `${userID}-fullVideo`;
  });
  const flagVideoInfos = await generateVideoInfosFromFlags(
    sourceVideoInfo,
    flags,
  );
  if (flagsSelected[`${userID}-fullVideo`]) {
    store.dispatch(
      addUserLocalArchive({
        archiveID: sourceVideoInfo.id,
        startTimestamp: sourceVideoInfo.startTimestamp,
      }),
    );
    shareVideosWithTeams([sourceVideoInfo.id], [coachSessionID]);
  } else {
    deleteVideos([sourceVideoInfo.id]);
  }
  if (flagVideoInfos.length > 0) {
    await Promise.all(flagVideoInfos.map((video) => addLocalVideo(video)));
    shareVideosWithTeams(flagVideoInfos.map((v) => v.id), [coachSessionID]);
  }
};

const addLocalVideo = async (video) => {
  if (!video.id) {
    video.id = getVideoUUID(video.url);
  }
  if (!video.startTimestamp) {
    video.startTimestamp = Date.now();
  }
  await store.dispatch(setArchive({...video, local: true}));
  await store.dispatch(
    addUserLocalArchive({
      archiveID: video.id,
      startTimestamp: video.startTimestamp,
    }),
  );
};

const deleteVideos = (ids) => {
  const infos = ids.map((id) => getVideoByID(id));
  infos.forEach((info) => {
    if (info.local) {
      deleteLocalVideoFile(info.url);
    } else {
      deleteCloudVideo(info.id);
    }
    store.dispatch(removeUserLocalArchive(info.id)); // offline entry in library
    store.dispatch(deleteArchive(info.id));
  });
};

const openVideoPlayer = async ({archives, open, coachSessionID}) => {
  await StatusBar.setBarStyle(open ? 'light-content' : 'dark-content', true);
  if (open) {
    return navigate('VideoPlayerPage', {
      archives,
      coachSessionID,
    });
  }
  return goBack();
};

const uploadLocalVideo = async (videoID, background) => {
  const videoInfo = store.getState().archives[videoID];
  if (videoInfo) {
    if (videoInfo.local) {
      const videoUploadTaskID = generateID();
      const imageUploadTaskID = generateID();
      const success = await createCloudVideo(videoInfo);
      if (success) {
        if (videoInfo.thumbnail.substring(0, 4) !== 'http') {
          store.dispatch(
            enqueueUploadTask({
              type: 'image',
              id: imageUploadTaskID,
              timeSubmitted: Date.now(),
              url: videoInfo.thumbnail,
              storageDestination: `archivedStreams/${videoID}`,
              isBackground: background,
              displayInList: false,
            }),
          );
        } else {
          setCloudVideoThumbnail(videoID, videoInfo.thumbnail);
        }
        store.dispatch(
          enqueueUploadTask({
            type: 'video',
            id: videoUploadTaskID,
            timeSubmitted: Date.now(),
            videoInfo,
            cloudID: videoID,
            storageDestination: `archivedStreams/${videoID}`,
            isBackground: background,
            displayInList: !background,
            progress: 0,
            afterUpload: async () => {
              await claimCloudVideo(videoInfo);
              await store.dispatch(setArchive({...videoInfo, local: false}));
              await store.dispatch(removeUserLocalArchive(videoID));
              deleteLocalVideoFile(videoInfo.url);
            },
          }),
        );
      }
      return success;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

const deleteLocalVideoFile = async (path) => {
  const filePath = path.split('///').pop(); // removes leading file:///
  RNFS.exists(filePath).then((res) => {
    if (res) {
      RNFS.unlink(filePath).then(() => console.log('FILE DELETED'));
    }
  });
};

const shareVideosWithTeams = async (videos, objectIDs) => {
  const userID = store.getState().user.userID;
  const infoUser = store.getState().user.infoUser.userInfo;
  const allSessions = store.getState().coachSessions;
  const selectedSessions = objectIDs.reduce((selectedSessions, id) => {
    return assoc(id, allSessions[id], selectedSessions);
  }, {});
  const cloudEntriesCreated = await Promise.all(
    videos.map((videoID) => uploadLocalVideo(videoID)),
  );
  const newContents = videos.reduce((newContents, videoID) => {
    const content = {
      id: videoID,
      timeStamp: Date.now(),
    };
    return assoc(videoID, content, newContents);
  }, {});
  Object.values(selectedSessions).forEach((session) => {
    videos.forEach((videoID) => {
      if (session.members) {
        Object.keys(session.members)
          .filter((memberID) => memberID !== userID)
          .forEach((memberID) => {
            shareCloudVideo(memberID, videoID);
          });
      }
      sendNewMessage({
        objectID: session.objectID,
        user: {
          id: userID,
          info: infoUser,
        },
        text: '',
        type: 'video',
        content: videoID,
      });
    });
    database()
      .ref(`coachSessions/${session.objectID}/contents`)
      .update(newContents);
  });
};

const generateThumbnailSet = async (source, timeBounds, size, callback) => {
  if (!source) {
    return;
  }
  const dt = (timeBounds[1] - timeBounds[0]) / size;
  const m = timeBounds[0] + dt / 2;
  let thumbnails = [];
  for (var x = 0; x < size; x++) {
    let time = (dt * x + m) * 1000;
    thumbnails.push(
      await createThumbnail({
        url: source,
        timeStamp: time,
      }).then((r) => {
        if (callback) {
          callback(r);
        }
        return r;
      }),
    );
  }
  return thumbnails;
};

const getVideoByID = (id) => {
  return store.getState().archives[id];
};

const updateLocalVideoUrls = () => {
  const videos = store.getState().archives;
  if (videos) {
    Object.values(videos)
      .filter((v) => v.local)
      .forEach(async (video) => {
        if (video.url) {
          const videoExists = await RNFS.exists(video.url);
          if (!videoExists) {
            const newUrl = updateVideoSavePath(video.url);
            const fixWorked = await RNFS.exists(newUrl);
            if (fixWorked) {
              const {path: newThumbnail} = await createThumbnail({
                url: newUrl,
              });
              store.dispatch(
                setArchive({...video, url: newUrl, thumbnail: newThumbnail}),
              );
            } else {
              store.dispatch(
                setArchive({
                  ...video,
                  url: '',
                  thumbnail: '',
                  error: 'File does not exist',
                }),
              );
            }
          } else if (!video.thumbnail || video.thumbnail === '') {
            const {path: newThumbnail} = await createThumbnail({
              url: video.url,
            });
            store.dispatch(setArchive({...video, thumbnail: newThumbnail}));
          } else {
            const thumbnailExists = RNFS.exists(video.thumbnail);
            if (!thumbnailExists) {
              const {path: newThumbnail} = await createThumbnail({
                url: video.url,
              });
              store.dispatch(setArchive({...video, thumbnail: newThumbnail}));
            }
          }
        }
      });
  }
};

const oneTimeFixStoreLocalVideoLibrary = () => {
  const localVideos = store.getState().localVideoLibrary.videoLibrary;
  if (localVideos) {
    Object.values(localVideos)
      .filter((v) => v && v.id && v.url && v.thumbnail)
      .forEach((video) => {
        addLocalVideo(video);
        store.dispatch(legacyRemoveUserLocalArchive(video.id));
      });
  }
};

export {
  arrayUploadFromSnippets,
  addLocalVideo,
  uploadLocalVideo,
  deleteVideos,
  openVideoPlayer,
  shareVideosWithTeams,
  getVideoByID,
  generateThumbnailSet,
  updateLocalVideoUrls,
  oneTimeFixStoreLocalVideoLibrary,
};
