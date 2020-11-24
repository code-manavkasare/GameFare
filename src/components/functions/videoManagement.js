import {ProcessingManager} from 'react-native-video-processing';
import RNFS from 'react-native-fs';
import database from '@react-native-firebase/database';
import {DocumentDirectoryPath} from 'react-native-fs';
import {assoc} from 'ramda';
import {getPhotos} from '@react-native-community/cameraroll';

import {
  checkVideoLibraryAccess,
  getNewVideoSavePath,
  getOpentokVideoInfo,
  getVideoUUID,
  updateVideoSavePath,
  generateThumbnail,
  getNativeVideoInfo,
} from './pictures';
import {generateID} from './utility';

import {navigate, goBack, getCurrentRoute} from '../../../NavigationService';

import {store} from '../../store/reduxStore';
import {sendNewMessage} from './message';
import {
  enqueueUploadTask,
  dequeueUploadTask,
  modifyUploadTask,
} from '../../store/actions/uploadQueueActions';
import {
  addUserLocalArchive,
  removeUserLocalArchives,
  legacyRemoveUserLocalArchive,
  removeUserLocalArchive,
} from '../../store/actions/localVideoLibraryActions';
import {setArchive, deleteArchives} from '../../store/actions/archivesActions';
import {getArchiveByID} from './archive';
import {
  createCloudVideo,
  setCloudVideoThumbnail,
  shareCloudVideo,
  deleteCloudVideos,
  deleteCloudVideoInfo,
  updateThumbnailCloud,
} from '../database/firebase/videosManagement';

const generateVideoInfosFromFlags = async (
  sourceVideoInfo,
  flags,
  videoOrientation,
) => {
  if (flags.length > 0) {
    return await Promise.all(
      flags.map(async (flag) => {
        const {startTime, stopTime, thumbnail} = flag;
        const trimOptions = {
          startTime: startTime / 1000,
          endTime: stopTime / 1000,
          saveWithCurrentDate: true,
          videoOrientation,
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
  const {fullVideo, orientation} = recording;
  const {id} = fullVideo;
  const sourceVideoInfo = store.getState().archives[id];
  const flags = Object.values(flagsSelected).filter((flag) => {
    return flag?.id !== `${userID}-fullVideo`;
  });
  const flagVideoInfos = await generateVideoInfosFromFlags(
    sourceVideoInfo,
    flags,
    orientation,
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
  return video.id;
};

const deleteVideos = (ids) => {
  const infos = ids.map((id) => getArchiveByID(id));
  store.dispatch(removeUserLocalArchives(ids));

  deleteCloudVideos(ids);
  infos.forEach((info) => {
    if (info && info.local && info.url) {
      const uploadTasks = uploadAlreadyInQueue(info.id);
      uploadTasks?.map((item) => {
        store.dispatch(dequeueUploadTask(item.id));
      });
      deleteLocalVideoFile(info.url);
    }
    //Solve edge case when delete upload not finished of a shared video
    if (info.local && info.progress) {
      deleteCloudVideoInfo(info.id);
    }
  });
  store.dispatch(deleteArchives(ids));
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
  } else if (getCurrentRoute() === 'VideoPlayerPage') {
    return goBack();
  }
  return;
};

const uploadAlreadyInQueue = (videoID) => {
  const uploadQueue = store.getState().uploadQueue.queue;

  if (!uploadQueue) return false;
  const matchingTasks = Object.values(uploadQueue).filter(
    (item) => item.cloudID === videoID,
  );
  return matchingTasks.length > 0 ? matchingTasks : null;
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
        cloudID: videoID,
        storageDestination: `archivedStreams/${videoID}`,
        isBackground: background,
        displayInList: false,
        afterUpload: async (thumbnail) => {
          await updateThumbnailCloud({
            id: videoID,
            thumbnail,
            startTimestamp: videoInfo.startTimestamp,
          });
          await store.dispatch(
            setArchive({
              id: videoID,
              thumbnail,
              local: false,
            }),
          );
          await store.dispatch(removeUserLocalArchive(videoID));
        },
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
    }),
  );
};

const uploadLocalVideo = async (videoID, background) => {
  const videoInfo = store.getState().archives[videoID];
  if (videoInfo) {
    if (videoInfo.local) {
      const isUploadAlreadyInQueue = uploadAlreadyInQueue(videoID);
      if (isUploadAlreadyInQueue) {
        return isUploadAlreadyInQueue.map((item) =>
          store.dispatch(
            modifyUploadTask({
              id: item.id,
              isBackground: false,
            }),
          ),
        );
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
      RNFS.unlink(filePath).then(() => console.log('FILE DELETED', path));
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
  return cloudEntriesCreated;
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
        await generateThumbnail(source, time).then((r) => {
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

const updateLocalVideoUrls = async () => {
  const videos = store.getState().archives;
  if (videos) {
    await Object.values(videos)
      .filter((v) => v.local)
      .forEach(async (video) => {
        if (video.url) {
          const videoExists = await RNFS.exists(video.url);
          if (!videoExists) {
            const newUrl = updateVideoSavePath(video.url);
            const fixWorked = await RNFS.exists(newUrl);
            if (fixWorked) {
              const {
                path: newThumbnail,
                height: heightThumbnail,
                width: widthThumbnail,
              } = await generateThumbnail(newUrl);
              store.dispatch(
                setArchive({
                  ...video,
                  url: newUrl,
                  thumbnail: newThumbnail,
                  thumbnailSize: {
                    height: heightThumbnail,
                    width: widthThumbnail,
                  },
                }),
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
            const {
              path: newThumbnail,
              height: heightThumbnail,
              width: widthThumbnail,
            } = await generateThumbnail(video.url);
            store.dispatch(
              setArchive({
                ...video,
                thumbnail: newThumbnail,
                thumbnailSize: {height: heightThumbnail, width: widthThumbnail},
              }),
            );
          } else {
            const thumbnailExists = RNFS.exists(video.thumbnail);
            if (!thumbnailExists) {
              const {
                path: newThumbnail,
                height: heightThumbnail,
                width: widthThumbnail,
              } = await generateThumbnail(video.url);
              store.dispatch(
                setArchive({
                  ...video,
                  thumbnail: newThumbnail,
                  thumbnailSize: {
                    height: heightThumbnail,
                    width: widthThumbnail,
                  },
                }),
              );
            }
          }
        }
      });
  }
};

const oneTimeFixStoreLocalVideoLibrary = async () => {
  // moves all videos from localVideoLibrary to archives
  const localVideos = store.getState().localVideoLibrary.videoLibrary;
  if (localVideos) {
    await Object.values(localVideos)
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
  let newArchive = {...archive};
  const thumbnailPath = await generateThumbnail(archive.url);
  const oldThumbnailPath = archive.thumbnail;
  newArchive.thumbnail = thumbnailPath;
  store.dispatch(setArchive(newArchive));
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

const selectVideosFromCameraRoll = () => {
  checkVideoLibraryAccess();
  navigate('SelectVideosFromLibrary', {
    selectableMode: true,
    selectOnly: true,
    navigateBackAfterConfirm: true,
    selectFromCameraRoll: true,
    modalMode: true,
    confirmVideo: async (selectedVideos) => {
      console.log('selectedVideos: ', selectedVideos);
    },
  });
};

const goToLibraryPage = () => {
  navigate('VideoLibrary');
};

const getVideosFromCameraroll = async (lastElement = false) => {
  let params = {assetType: 'Videos', first: 18};
  if (lastElement) {
    params.after = lastElement;
  }
  const videos = await getPhotos(params);
  return Promise.resolve(videos);
};

const formatVideoDataFromCameraroll = (edge) => {
  const {height, playableDuration, uri, width} = edge.node.image;
  const video = {
    durationSeconds: playableDuration,
    fromNativeLibrary: true,
    id: getIdFromPhPath(uri),
    localIdentifier: getLocalIdentifierFromPhPath(uri),
    local: true,
    size: {
      height,
      width,
    },
    startTimestamp: edge.node.timestamp * 1000,
    url: uri,
  };
  return video;
};

const getIdFromPhPath = (phPath) => {
  return phPath.slice(5, 41);
};

const getLocalIdentifierFromPhPath = (phPath) => {
  return phPath.slice(5, 48);
};

const getVideosFormattedFromCameraroll = async (lastElement = false) => {
  const videos = await getVideosFromCameraroll(lastElement);
  const videosFormatted = videos.edges.map((edge) =>
    formatVideoDataFromCameraroll(edge),
  );
  return {videosFormatted, page_info: videos.page_info};
};

const openVideoPlayerIfOneVideoImported = (videosInfos) => {
  if (videosInfos.length === 1) {
    openVideoPlayer({
      archives: [videosInfos[0].id],
      open: true,
    });
  }
};

const addVideosFromCamerarollToApp = async (videos) => {
  const videosInfos = await Promise.all(
    videos.map((localIdentifier) => getNativeVideoInfo(localIdentifier)),
  );
  videosInfos.forEach((video) => {
    addLocalVideo({video, backgroundUpload: true});
  });
  goToLibraryPage();
  openVideoPlayerIfOneVideoImported(videosInfos);
};
export {
  addVideosFromCamerarollToApp,
  addLocalVideo,
  arrayUploadFromSnippets,
  deleteLocalVideoFile,
  deleteVideos,
  dimensionRectangle,
  generateThumbnailSet,
  oneTimeFixStoreLocalVideoLibrary,
  openVideoPlayer,
  regenerateThumbnail,
  selectVideosFromCameraRoll,
  shareVideosWithTeams,
  updateLocalUploadProgress,
  updateLocalVideoUrls,
  uploadLocalVideo,
  getVideosFormattedFromCameraroll,
};
