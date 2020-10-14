import {ProcessingManager} from 'react-native-video-processing';
import RNFS from 'react-native-fs';
import database from '@react-native-firebase/database';
import {createThumbnail} from 'react-native-create-thumbnail';
import {DocumentDirectoryPath} from 'react-native-fs';
import {assoc} from 'ramda';

import {
  getNewVideoSavePath,
  getOpentokVideoInfo,
  getVideoUUID,
  updateVideoSavePath,
} from './pictures';
import {generateID} from './utility';

import {navigate, goBack} from '../../../NavigationService';

import {store} from '../../../reduxStore';
import {sendNewMessage} from './message';
import {
  enqueueUploadTask,
  dequeueUploadTask,
  modifyUploadTask,
} from '../../actions/uploadQueueActions';
import {
  addUserLocalArchive,
  removeUserLocalArchive,
  removeUserLocalArchives,
  legacyRemoveUserLocalArchive,
} from '../../actions/localVideoLibraryActions';
import {setArchive, deleteArchives} from '../../actions/archivesActions';
import {getArchiveByID} from './archive';
import {
  createCloudVideo,
  setCloudVideoThumbnail,
  claimCloudVideo,
  shareCloudVideo,
  deleteCloudVideos,
} from '../database/firebase/videosManagement';
import {generateThumbnail} from './pictures.js';

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
        backgroundUpload: false,
      }),
    );
    shareVideosWithTeams([sourceVideoInfo.id], [coachSessionID]);
  } else {
    deleteVideos([sourceVideoInfo.id]);
  }
  if (flagVideoInfos.length > 0) {
    await Promise.all(
      flagVideoInfos.map((video) =>
        addLocalVideo({video, backgroundUpload: false}),
      ),
    );
    await shareVideosWithTeams(flagVideoInfos.map((v) => v.id), [
      coachSessionID,
    ]);
  }
};

const addLocalVideo = async ({video, backgroundUpload}) => {
  // 'video' param from getVideoInfo(someUrl) in pictures.js
  if (!video.id) {
    video.id = getVideoUUID(video.url);
  }
  const {url} = video;
  if (url) {
    video.local = true;
    video.startTimestamp = video.startTimestamp
      ? video.startTimestamp
      : Date.now();
    if (url.indexOf(DocumentDirectoryPath) === -1) {
      // need to copy video into permanent file
      // 'volatile' property is so that background uploading will not try to upload this file while we copy it
      store.dispatch(setArchive({...video, volatile: true}));
      const newPath = getNewVideoSavePath();
      RNFS.copyFile(url, newPath).then(() => {
        store.dispatch(setArchive({...video, url: newPath, volatile: false}));
      });
    } else {
      store.dispatch(setArchive(video));
    }
    // create 'offline' entry
    store.dispatch(
      addUserLocalArchive({
        archiveID: video.id,
        startTimestamp: video.startTimestamp,
        backgroundUpload,
      }),
    );
  }
};

const deleteVideos = (ids) => {
  const infos = ids.map((id) => getArchiveByID(id));
  store.dispatch(removeUserLocalArchives(ids));
  store.dispatch(deleteArchives(ids));
  deleteCloudVideos(ids);
  infos.forEach((info) => {
    if (info && info.local && info.url) {
      deleteLocalVideoFile(info.url);
    }
  });
};

const openVideoPlayer = async ({
  archives,
  open,
  coachSessionID,
  forceSharing,
}) => {
  if (open) {
    return navigate('VideoPlayerPage', {
      archives,
      coachSessionID,
      forceSharing,
    });
  }
  return goBack();
};

const uploadAlreadyInQueue = (videoID) => {
  const uploadQueue = store.getState().uploadQueue.queue;

  if (!uploadQueue) return false;
  return Object.values(uploadQueue).filter(
    (item) => item.cloudID === videoID,
  )[0];
};

const launchUpload = async ({
  videoID,
  background,
  videoInfo,
  imageUploadTaskID,
  videoUploadTaskID,
}) => {
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
      displayInList: true,
      progress: 0,
      afterUpload: async () => {
        await claimCloudVideo(videoInfo);
        await store.dispatch(setArchive({...videoInfo, local: false}));
        await store.dispatch(removeUserLocalArchive(videoID));
        deleteLocalVideoFile(videoInfo.url);
      },
    }),
  );
};

const uploadLocalVideo = async (videoID, background) => {
  const videoInfo = store.getState().archives[videoID];

  if (videoInfo) {
    if (videoInfo.local) {
      const isUploadAlreadyInQueue = uploadAlreadyInQueue(videoID);
      if (isUploadAlreadyInQueue) {
        if (isUploadAlreadyInQueue.uploading) return true;

        return modifyUploadTask({
          id: isUploadAlreadyInQueue.id,
          isBackground: true,
        });
      }
      const videoUploadTaskID = generateID();
      const imageUploadTaskID = generateID();
      const success = await createCloudVideo(videoInfo);
      if (success) {
        launchUpload({
          videoID,
          background,
          videoInfo,
          imageUploadTaskID,
          videoUploadTaskID,
        });
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
  // only waits until cloud entries are created, upload continues after return
  const userID = store.getState().user.userID;
  const infoUser = store.getState().user.infoUser.userInfo;
  const allSessions = store.getState().coachSessions;
  const selectedSessions = objectIDs.reduce((selectedSessions, id) => {
    return assoc(id, allSessions[id], selectedSessions);
  }, {});
  const cloudEntriesCreated = await Promise.all(
    videos.map((videoID) => uploadLocalVideo(videoID, false)),
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
          .forEach((memberID) => shareCloudVideo(memberID, videoID));
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

const generateThumbnailSet = async ({
  source,
  timeBounds,
  size,
  callback,
  index,
}) => {
  if (!source) {
    return;
  }
  const dt = (timeBounds[1] - timeBounds[0]) / size;
  const m = timeBounds[0] + dt / 2;
  let thumbnails = [];
  for (var x = 0; x < size; x++) {
    let time = (dt * x + m) * 1000;
    if (!index || index === x) {
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
      if (index === x) {
        return thumbnails;
      }
    }
  }
  return thumbnails;
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
  // moves all videos from localVideoLibrary to archives
  const localVideos = store.getState().localVideoLibrary.videoLibrary;
  if (localVideos) {
    Object.values(localVideos)
      .filter((v) => v && v.id && v.url && v.thumbnail)
      .forEach((video) => {
        addLocalVideo({video, backgroundUpload: true});
        store.dispatch(legacyRemoveUserLocalArchive(video.id));
      });
  }
};

const updateLocalUploadProgress = (videoID, progress) => {
  const videoInfo = store.getState().archives[videoID];
  if (videoInfo) {
    store.dispatch(setArchive({...videoInfo, progress}));
  }
};

const regenerateThumbnail = async (archive) => {
  const thumbnailPath = await generateThumbnail(archive.url);
  const oldThumbnailPath = archive.thumbnail;
  archive.thumbnail = thumbnailPath;
  store.dispatch(setArchive(archive));
  RNFS.unlink(oldThumbnailPath);
};

const dimensionRectangle = ({startPoint, endPoint}) => {
  const {x: x1, y: y1} = startPoint;
  const {x: x2, y: y2} = endPoint;
  let radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  if (!radius) radius = 0;
  const slope =
    (Math.max(y2, y1) - Math.min(y1, y2)) /
    (Math.max(x2, x1) - Math.min(x1, x2));
  if (!slope) return {height: 0, width: 0};
  const beta = Math.atan(slope);

  let width = Math.cos(beta) * radius;
  const height = Math.sqrt(Math.pow(radius, 2) - Math.pow(width, 2));

  return {height: y2 < y1 ? -height : height, width: x2 < x1 ? -width : width};
};

export {
  addLocalVideo,
  arrayUploadFromSnippets,
  deleteVideos,
  dimensionRectangle,
  generateThumbnailSet,
  oneTimeFixStoreLocalVideoLibrary,
  openVideoPlayer,
  regenerateThumbnail,
  shareVideosWithTeams,
  updateLocalUploadProgress,
  updateLocalVideoUrls,
  uploadLocalVideo,
};
