import React, {Component} from 'react';
import {ProcessingManager} from 'react-native-video-processing';
import StatusBar from '@react-native-community/status-bar';
import RNFS from 'react-native-fs';
import {Image} from 'react-native';

import database from '@react-native-firebase/database';
import {createThumbnail} from 'react-native-create-thumbnail';

import {getVideoInfo, getVideoUUID} from './pictures';

import {navigate, goBack} from '../../../NavigationService';

import {store} from '../../../reduxStore';
import {
  addVideos,
  deleteVideo,
  hideVideo,
} from '../../actions/localVideoLibraryActions';
import {sendNewMessage} from './message';
import {enqueueFileUpload} from '../../actions/uploadQueueActions';
import {setLayout} from '../../actions/layoutActions';

import {
  shareCloudVideo,
  createCloudVideo,
  setCloudThumbnail,
} from '../database/firebase/videosManagement';
import {getNativeVideoInfo} from '../functions/pictures';

import {FormatDate, formatDuration} from './date';
import AsyncImage from '../layout/image/AsyncImage';
import colors from '../style/colors';
import styleApp from '../style/style';

const generateSnippetsFromFlags = async (source, flags) => {
  for (var f in flags) {
    let flag = flags[f];
    const {id, startTime, stopTime} = flag;
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
  let snippets = [];
  let flags = Object.values(flagsSelected).filter((flag) => {
    return flag?.id !== `${userID}-fullVideo`;
  });
  if (flags.length > 0) {
    const flagsWithSnippets = await generateSnippetsFromFlags(
      recording.localSource,
      flags,
    );
    for (const flag of flagsWithSnippets) {
      let {snippetLocalPath, thumbnail} = flag;
      const videoInfo = await getVideoInfo(snippetLocalPath, thumbnail);
      const cloudVideo = await uploadLocalVideo(videoInfo, members);
      const destinationCloud = `archivedStreams/${cloudVideo.id}`;
      members.map((member) => {
        shareCloudVideo(member.id, cloudVideo.id);
      });
      snippets.push({
        type: 'video',
        videoInfo,
        cloudID: cloudVideo.id,
        storageDestination: destinationCloud,
        shareProgressWith: members,
        displayInList: true,
        progress: 0,
        date: Date.now(),
      });
    }
  }
  if (flagsSelected[`${userID}-fullVideo`]) {
    const {localSource, thumbnail} = recording;
    const videoInfo = await getVideoInfo(localSource, thumbnail);
    const cloudVideo = await uploadLocalVideo(videoInfo, members);
    const destinationCloud = `archivedStreams/${cloudVideo.id}`;
    members.map((member) => {
      shareCloudVideo(member.id, cloudVideo.id);
    });
    snippets.push({
      type: 'video',
      videoInfo,
      cloudID: cloudVideo.id,
      storageDestination: destinationCloud,
      shareProgressWith: members,
      displayInList: true,
      progress: 0,
      date: Date.now(),
    });
  }
  return snippets;
};
const addLocalVideo = async (video) => {
  if (!video.id) {
    video.id = getVideoUUID(video.url);
  }
  await store.dispatch(addVideos({[video.id]: video}));
};

const removeLocalVideo = (id) => {
  const videoInfo = store.getState().localVideoLibrary.videoLibrary[id];
  if (videoInfo) {
    store.dispatch(deleteVideo(id));
    if (videoInfo.url) {
      deleteLocalVideoFile(videoInfo.url);
    }
  }
};

const recordVideo = async () => {
  await store.dispatch(setLayout({isFooterVisible: false}));
  navigate('LocalSession');
};

const openVideoPlayer = async ({archives, open, coachSessionID}) => {
  console.log('open video player,', coachSessionID);
  await StatusBar.setBarStyle(open ? 'light-content' : 'dark-content', true);
  console.log('openVideoPlayer', {archives, open, coachSessionID});
  if (open)
    return navigate('VideoPlayerPage', {
      archives,
      coachSessionID,
    });
  return goBack();
};

const uploadLocalVideo = async (videoInfo, shareProgressWith) => {
  const cloudVideo = await createCloudVideo(videoInfo);
  store.dispatch(hideVideo(videoInfo.id));
  let {thumbnail, url, fromNativeLibrary, id} = videoInfo;
  if (thumbnail) {
    if (thumbnail.substring(0, 4) === 'http') {
      setCloudThumbnail(cloudVideo.id, videoInfo.thumbnail);
    } else {
      store.dispatch(
        enqueueFileUpload({
          type: 'image',
          url: thumbnail,
          storageDestination: `archivedStreams/${cloudVideo.id}`,
          displayInList: false,
        }),
      );
    }
  }
  store.dispatch(
    enqueueFileUpload({
      type: 'video',
      videoInfo,
      cloudID: cloudVideo.id,
      storageDestination: `archivedStreams/${cloudVideo.id}`,
      shareProgressWith,
      displayInList: true,
      progress: 0,
    }),
  );
  return cloudVideo;
};

const deleteLocalVideoFile = async (path) => {
  const filePath = path.split('///').pop(); // removes leading file:///
  RNFS.exists(filePath).then((res) => {
    if (res) {
      RNFS.unlink(filePath).then(() => console.log('FILE DELETED'));
    }
  });
};

const shareVideosWithPeople = async (
  localVideos,
  firebaseVideos,
  users,
  contacts,
) => {
  const videosToUpload = localVideos.map(
    (id) => store.getState().localVideoLibrary.videoLibrary[id],
  );
  const cloudVideos = await Promise.all(
    videosToUpload.map((video) => uploadLocalVideo(video)),
  );
  let allVideos = firebaseVideos.concat(cloudVideos.map((vid) => vid.id));
  Object.values(users).map((user) => {
    allVideos.map((videoID) => {
      shareCloudVideo(user.id, videoID);
    });
  });
  Object.values(contacts).map((contact) => {
    console.log('contact share is null operation', contact);
  });
};

const shareVideosWithTeam = async (localVideos, firebaseVideos, objectID) => {
  const userID = store.getState().user.userID;
  const infoUser = store.getState().user.infoUser.userInfo;
  const videosToUpload = localVideos?.map(
    (id) => store.getState().localVideoLibrary.videoLibrary[id],
  );
  const cloudVideos = await Promise.all(
    videosToUpload.map((video) => uploadLocalVideo(video)),
  );
  let allVideos = firebaseVideos.concat(cloudVideos.map((vid) => vid.id));
  for (let i in allVideos) {
    const videoID = allVideos[i];
    await sendNewMessage({
      objectID,
      user: {
        id: userID,
        info: infoUser,
      },
      text: '',
      type: 'video',
      content: videoID,
    });
  }
  await database()
    .ref(`coachSessions/${objectID}/contents`)
    .update(
      Object.values(allVideos).reduce(function(result, item) {
        result[item] = {
          id: item,
          timeStamp: Date.now(),
        };
        return result;
      }, {}),
    );
  return allVideos;
};

const generateThumbnailSet = async (source, timeBounds, size, callback) => {
  if (!source) {
    return;
  }
  // console.log(timeBounds, size);
  const dt = (timeBounds[1] - timeBounds[0]) / size;
  // console.log('dt', dt);
  const m = timeBounds[0] + dt / 2;
  // console.log('m', m);
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
  // console.log(thumbnails.length);
  return thumbnails;
};

const getFirebaseVideoByID = (id) => {
  return store.getState().archives[id];
};

const getLocalVideoByID = (id) => {
  return store.getState().localVideoLibrary.videoLibrary[id];
};

export {
  generateSnippetsFromFlags,
  arrayUploadFromSnippets,
  addLocalVideo,
  removeLocalVideo,
  uploadLocalVideo,
  recordVideo,
  openVideoPlayer,
  shareVideosWithPeople,
  shareVideosWithTeam,
  getFirebaseVideoByID,
  getLocalVideoByID,
  generateThumbnailSet,
};
