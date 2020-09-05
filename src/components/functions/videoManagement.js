import {ProcessingManager} from 'react-native-video-processing';
import RNFS from 'react-native-fs';
import {StatusBar} from 'react-native';

import database from '@react-native-firebase/database';
import {createThumbnail} from 'react-native-create-thumbnail';

import {getVideoInfo, getVideoUUID, updateVideoSavePath} from './pictures';
import {generateID} from './utility';

import {navigate, goBack} from '../../../NavigationService';

import {store} from '../../../reduxStore';
import {
  addVideos,
  removeVideo,
  hideVideo,
  updateLocalPath,
  updateLocalThumbnail,
  updateProgressLocalVideo,
} from '../../actions/localVideoLibraryActions';
import {sendNewMessage} from './message';
import {enqueueUploadTask} from '../../actions/uploadQueueActions';
import {setLayout} from '../../actions/layoutActions';

import {
  shareCloudVideo,
  createCloudVideo,
  claimCloudVideo,
  setCloudVideoThumbnail,
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
  memberID,
  members,
  userID,
}) => {
  let flags = Object.values(flagsSelected).filter((flag) => {
    return flag?.id !== `${userID}-fullVideo`;
  });
  if (flags.length > 0) {
    const flagsWithSnippets = await generateSnippetsFromFlags(
      recording.localSource,
      flags,
    );
    flagsWithSnippets.forEach(async (flag, index) => {
      let {snippetLocalPath, thumbnail} = flag;
      const videoInfo = await getVideoInfo(snippetLocalPath, thumbnail);
      const cloudVideo = await uploadLocalVideo(videoInfo);
      members.map((member) => {
        shareCloudVideo(member.id, cloudVideo.id);
      });
    });
  }
  if (flagsSelected[`${userID}-fullVideo`]) {
    const {localSource, thumbnail} = recording;
    const videoInfo = await getVideoInfo(localSource, thumbnail);
    const cloudVideo = await uploadLocalVideo(videoInfo);
    members.map((member) => {
      shareCloudVideo(member.id, cloudVideo.id);
    });
  }
};

const addLocalVideo = async (video) => {
  if (!video.id) {
    video.id = getVideoUUID(video.url);
  }
  await store.dispatch(addVideos({[video.id]: video}));
};

const deleteLocalVideo = (id) => {
  const videoInfo = getLocalVideoByID(id);
  if (videoInfo) {
    store.dispatch(removeVideo(id));
    if (videoInfo.url) {
      deleteLocalVideoFile(videoInfo.url);
    }
  }
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

const uploadLocalVideo = async (videoInfo, background) => {
  const videoUploadTaskID = generateID();
  const cloudVideo = await createCloudVideo(videoInfo);
  store.dispatch(
    enqueueUploadTask({
      type: 'image',
      id: generateID(),
      timeSubmitted: Date.now(),
      url: videoInfo.thumbnail,
      storageDestination: `archivedStreams/${cloudVideo.id}`,
      isBackground: background,
      displayInList: false,
      afterUpload: () => {
        store.dispatch(hideVideo(videoInfo.id));
        claimCloudVideo(cloudVideo.id);
      },
    })
  );
  store.dispatch(
    enqueueUploadTask({
      type: 'video',
      id: videoUploadTaskID,
      timeSubmitted: Date.now(),
      videoInfo,
      cloudID: cloudVideo.id,
      storageDestination: `archivedStreams/${cloudVideo.id}`,
      isBackground: background,
      displayInList: !background,
      progress: 0,
      afterUpload: () => {
        deleteLocalVideo(videoInfo.id);
      },
    })
  );
  return cloudVideo;
};

const uploadLocalVideoLazy = async (
  videoInfo,
  background,
) => {
  const cloudVideo = await createCloudVideo(videoInfo);
  const videoUploadTaskID = generateID();
  store.dispatch(
    enqueueUploadTask({
      type: 'video',
      id: videoUploadTaskID,
      timeSubmitted: Date.now(),
      videoInfo,
      cloudID: cloudVideo.id,
      storageDestination: `archivedStreams/${cloudVideo.id}`,
      isBackground: background,
      displayInList: !background,
    }),
  );
  store.dispatch(
    enqueueUploadTask({
      type: 'image',
      id: generateID(),
      timeSubmitted: Date.now(),
      url: videoInfo.thumbnail,
      storageDestination: `archivedStreams/${cloudVideo.id}`,
      isBackground: background,
      displayInList: false,
      afterUpload: () => {
        claimCloudVideo(cloudVideo.id);
        deleteLocalVideo(videoInfo.id);
      },
    }),
  );
};

const deleteLocalVideoFile = async (path) => {
  const filePath = path.split('///').pop(); // removes leading file:///
  RNFS.exists(filePath).then((res) => {
    if (res) {
      RNFS.unlink(filePath).then(() => console.log('FILE DELETED'));
    }
  });
};

const shareVideosWithTeams = async (localVideos, firebaseVideos, objectIDs) => {
  const userID = store.getState().user.userID;
  const infoUser = store.getState().user.infoUser.userInfo;
  const videosToUpload = localVideos?.map(
    (id) => store.getState().localVideoLibrary.videoLibrary[id],
  );
  const cloudVideos = await Promise.all(
    videosToUpload.map((video) => uploadLocalVideo(video)),
  );
  const allVideos = firebaseVideos.concat(cloudVideos.map((vid) => vid.id));
  const addToContents = allVideos.reduce((newContents, videoID) => {
    newContents[videoID] = {
      id: videoID,
      timeStamp: Date.now(),
    };
    return newContents;
  }, {});
  objectIDs.forEach((objectID) => {
    allVideos.forEach((videoID) => {
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

  return allVideos;
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
  const videos = store.getState().localVideoLibrary.videoLibrary;
  if (videos) {
    Object.values(videos).forEach((video) => {
      if (video.url) {
        RNFS.exists(video.url).then(async (videoExists) => {
          if (!videoExists) {
            // video moved, fix path and make new thumbnail
            const newUrl = updateVideoSavePath(video.url);
            const {path: newThumbnail} = await createThumbnail({
              url: newUrl,
            });
            store.dispatch(updateLocalPath({id: video.id, url: newUrl}));
            store.dispatch(
              updateLocalThumbnail({id: video.id, thumbnail: newThumbnail}),
            );
          } else {
            RNFS.exists(video.thumbnail).then(async (thumbnailExists) => {
              if (!thumbnailExists) {
                // video not moved but need to make new thumbnail
                const {path: newThumbnail} = await createThumbnail({
                  url: video.url,
                });
                store.dispatch(
                  updateLocalThumbnail({id: video.id, thumbnail: newThumbnail}),
                );
              }
            });
          }
        });
      }
    });
  }
};

const updateLocalUploadProgress = (videoID, progress) => {
  const videoInfo = store.getState().localVideoLibrary.videoLibrary[videoID];
  if (videoInfo) {
    store.dispatch(updateProgressLocalVideo({videoID: videoInfo.id, progress}));
  }
};

export {
  generateSnippetsFromFlags,
  arrayUploadFromSnippets,
  addLocalVideo,
  deleteLocalVideo,
  uploadLocalVideo,
  uploadLocalVideoLazy,
  openVideoPlayer,
  shareVideosWithTeams,
  getFirebaseVideoByID,
  getLocalVideoByID,
  generateThumbnailSet,
  updateLocalVideoUrls,
  updateLocalUploadProgress,
};
