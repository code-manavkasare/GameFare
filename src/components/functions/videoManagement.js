import {ProcessingManager} from 'react-native-video-processing';
import RNFS from 'react-native-fs';
import {StatusBar} from 'react-native';

import database from '@react-native-firebase/database';
import {createThumbnail} from 'react-native-create-thumbnail';

import {getVideoInfo, getVideoUUID, updateVideoSavePath} from './pictures';
import {generateID} from './utility';

import {navigate, goBack} from '../../../NavigationService';

import {store} from '../../../reduxStore';
import {sendNewMessage} from './message';
import {enqueueUploadTask} from '../../actions/uploadQueueActions';
import {setLayout} from '../../actions/layoutActions';
import {
  addUserLocalArchive,
  removeUserLocalArchive,
} from '../../actions/localVideoLibraryActions';
import {
  setArchive,
  resetArchives,
  deleteArchive,
} from '../../actions/archivesActions';

import {
  shareCloudVideo,
  createCloudVideo,
  claimCloudVideo,
  setCloudVideoThumbnail,
  deleteCloudVideo,
} from '../database/firebase/videosManagement';

const generateSnippetsFromFlags = async (source, flags) => {
  for (var f in flags) {
    let flag = flags[f];
    const {startTime, stopTime} = flag;
    const trimOptions = {
      startTime: startTime / 1000,
      endTime: stopTime / 1000,
      saveToCameraRoll: true,
      saveWithCurrentDate: true,
    };

    if (!source) {
      flags[f].snippetLocalPath = 'simulator';
    } else {
      await ProcessingManager.trim(source, trimOptions).then(
        (snippetLocalPath) => {
          flags[f].snippetLocalPath = snippetLocalPath;
        },
      );
    }
  }
  return flags;
};

const arrayUploadFromSnippets = async ({
  flagsSelected,
  recording,
  coachSessionID,
  memberID,
  members,
  userID,
}) => {
  let videoInfos;
  let flags = Object.values(flagsSelected).filter((flag) => {
    return flag?.id !== `${userID}-fullVideo`;
  });
  if (flags.length > 0) {
    const flagsWithSnippets = await generateSnippetsFromFlags(
      recording.localSource,
      flags,
    );
    videoInfos = await Promise.all(
      flagsWithSnippets.map((flag, index) => {
        let {snippetLocalPath, thumbnail} = flag;
        return getVideoInfo(snippetLocalPath, thumbnail);
      }),
    );
  }
  if (flagsSelected[`${userID}-fullVideo`]) {
    const {localSource, thumbnail} = recording;
    videoInfos.push(await getVideoInfo(localSource, thumbnail));
  }
  await Promise.all(videoInfos.map((video) => addLocalVideo(video)));
  shareVideosWithTeams(videoInfos.map((v) => v.id), [coachSessionID]);
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
  const infos = ids.map((id) => getFirebaseVideoByID(id));
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
  if (videoInfo && videoInfo.local) {
    const videoUploadTaskID = generateID();
    const imageUploadTaskID = generateID();
    const success = createCloudVideo(videoInfo);
    if (success) {
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
          afterUpload: () => {
            claimCloudVideo(videoID);
            store.dispatch(setArchive({...videoInfo, local: false}));
            store.dispatch(removeUserLocalArchive(videoID));
            deleteLocalVideoFile(videoInfo.url);
          },
        }),
      );
    }
    return success;
  }
  return false;
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
  const videoInfos = videos.map((id) => store.getState().archives[id]);
  videoInfos.forEach((videoInfo) => uploadLocalVideo(videoInfo.id));
  const addToContents = videos.reduce((newContents, videoID) => {
    newContents[videoID] = {
      id: videoID,
      timeStamp: Date.now(),
    };
    return newContents;
  }, {});
  objectIDs.forEach((objectID) => {
    videos.forEach((videoID) => {
      sendNewMessage({
        objectID,
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
      .ref(`coachSessions/${objectID}/contents`)
      .update(addToContents);
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

const getFirebaseVideoByID = (id) => {
  return store.getState().archives[id];
};

const getLocalVideoByID = (id) => {
  return store.getState().localVideoLibrary.videoLibrary[id];
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
              store.dispatch(setArchive({...video, url: '', thumbnail: ''}));
            }
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
      });
  }
};

export {
  generateSnippetsFromFlags,
  arrayUploadFromSnippets,
  addLocalVideo,
  uploadLocalVideo,
  deleteVideos,
  openVideoPlayer,
  shareVideosWithTeams,
  getFirebaseVideoByID,
  getLocalVideoByID,
  generateThumbnailSet,
  updateLocalVideoUrls,
  oneTimeFixStoreLocalVideoLibrary,
};
