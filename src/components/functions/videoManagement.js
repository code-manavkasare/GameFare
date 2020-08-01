import React, {Component} from 'react';
import {ProcessingManager} from 'react-native-video-processing';
import StatusBar from '@react-native-community/status-bar';
import RNFS from 'react-native-fs';
import database from '@react-native-firebase/database';

import {createThumbnail} from 'react-native-create-thumbnail';
import {uploadImage} from '../functions/upload';

import {getVideoInfo, getVideoUUID} from './pictures';

import {generateID} from './createEvent';

import {navigate} from '../../../NavigationService';
import {store} from '../../../reduxStore';
import {
  addVideos,
  deleteVideo,
  deleteSnippet,
} from '../../actions/localVideoLibraryActions';
import {enqueueFileUpload} from '../../actions/uploadQueueActions';
import {setLayout} from '../../actions/layoutActions';
import {FormatDate, formatDuration} from './date';
import AsyncImage from '../layout/image/AsyncImage';
import colors from '../style/colors';
import styleApp from '../style/style'

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

    if (!source) flags[f].snippetLocalPath = 'simulator';
    else
      await ProcessingManager.trim(source, trimOptions).then(
        (snippetLocalPath) => {
          flags[f].snippetLocalPath = snippetLocalPath;
        },
      );
  }
  return flags;
};

const shareVideoWithMembers = (members, destinationCloud, userID, videoID) => {
  let updates = {};
  Object.values(members).map((member) => {
    const memberID = member.id;
    const timeStamp = Date.now();
    updates[`${destinationCloud}/members/${member.id}/timestamp`] = timeStamp;
    updates[`${destinationCloud}/members/${memberID}/id`] = memberID;
    updates[`${destinationCloud}/members/${memberID}/invitedBy`] = userID;
    updates[`users/${memberID}/${destinationCloud}/id`] = videoID;
    updates[`users/${memberID}/${destinationCloud}/startTimestamp`] = timeStamp;
    updates[`users/${memberID}/${destinationCloud}/uploadedByUser`] = true;
    updates[`users/${memberID}/archivedStreams/uploading/${videoID}`] = {};
  });
  return updates;
};

const generateProgressUpdates = (
  members,
  userID,
  videoID,
  thumbnail,
  durationSeconds,
  index,
) => {
  let constructor = {};
  let uploadPaths = [];
  Object.values(members).map((member) => {
    const memberID = member.id;
    const timeStamp = Date.now();
    let path = `users/${memberID}/archivedStreams/uploading/${videoID}`;
    constructor[path] = {
      filename: videoID,
      hostUser: userID,
      thumbnail,
      durationSeconds,
      date: Date.now(),
      progress: 0,
      index,
    };
    uploadPaths.push(path);
  });
  database()
    .ref()
    .update(constructor);
  return {
    constructor,
    uploadPaths,
  };
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
  let index = 0;
  if (flags.length > 0) {
    const flagsWithSnippets = await generateSnippetsFromFlags(
      recording.localSource,
      flags,
    );
    for (var i in flagsWithSnippets) {
      const flag = flagsWithSnippets[i];
      const {snippetLocalPath, startTime, stopTime, thumbnail} = flag;
      let thumbnailUploaded =
        thumbnail && thumbnail.substring(0, 4) === 'http' ? true : false;
      let videoInfo = await getVideoInfo(snippetLocalPath, !thumbnailUploaded);
      const destinationCloud = `archivedStreams/${videoInfo.id}`;
      if (thumbnailUploaded) {
        videoInfo.thumbnail = thumbnail;
      } else if (videoInfo.thumbnail) {
        videoInfo.thumbnail = await uploadImage(
          'file:///' + videoInfo.thumbnail,
          destinationCloud,
          'thumbnail.jpg',
        );
        thumbnailUploaded = true;
      }
      const updateMembers = shareVideoWithMembers(
        members,
        destinationCloud,
        userID,
        videoInfo.id,
      );
      const progressUpdates = generateProgressUpdates(
        members,
        userID,
        videoInfo.id,
        videoInfo.thumbnail,
        videoInfo.durationSeconds,
        index,
      );
      snippets.push({
        ...videoInfo,
        localIdentifier: videoInfo.id,
        storageDestination: destinationCloud,
        destinationFile: `${destinationCloud}/url`,
        firebaseUpdates: {
          [`${destinationCloud}/durationSeconds`]: videoInfo.durationSeconds,
          [`${destinationCloud}/id`]: videoInfo.id,
          [`${destinationCloud}/uploadedByUser`]: true,
          [`${destinationCloud}/sourceUser`]: memberID,
          [`${destinationCloud}/size`]: videoInfo.size,
          [`${destinationCloud}/startTimestamp`]: Date.now(),
          [`${destinationCloud}/thumbnail`]: videoInfo.thumbnail,
          ...updateMembers,
        },
        progressUpdates,
        type: 'video',
        displayInList: true,
        filename: videoInfo.id,
        progress: 0,
        updateFirebaseAfterUpload: true,
        date: Date.now(),
        uploadThumbnail: !thumbnailUploaded,
      });
      index++;
    }
  }
  if (flagsSelected[`${userID}-fullVideo`]) {
    const {localSource, thumbnail} = recording;
    let thumbnailUploaded = thumbnail ? true : false;
    let videoInfo = await getVideoInfo(localSource, !thumbnailUploaded);
    if (thumbnailUploaded) {
      videoInfo.thumbnail = thumbnail;
    } else if (videoInfo.thumbnail) {
      console.log(videoInfo.thumbnail);
      videoInfo.thumbnail = await uploadImage(
        'file:///' + videoInfo.thumbnail,
        destinationCloud,
        'thumbnail.jpg',
      );
      thumbnailUploaded = true;
    }
    const destinationCloud = `archivedStreams/${videoInfo.id}`;
    const updateMembers = shareVideoWithMembers(
      members,
      destinationCloud,
      userID,
      videoInfo.id,
    );
    const progressUpdates = generateProgressUpdates(
      members,
      userID,
      videoInfo.id,
      videoInfo.thumbnail,
      videoInfo.durationSeconds,
      index,
    );
    snippets.push({
      ...videoInfo,
      storageDestination: destinationCloud,
      destinationFile: `${destinationCloud}/url`,
      displayInList: true,
      firebaseUpdates: {
        [`${destinationCloud}/durationSeconds`]: videoInfo.durationSeconds,
        [`${destinationCloud}/id`]: videoInfo.id,
        [`${destinationCloud}/size`]: videoInfo.size,
        [`${destinationCloud}/uploadedByUser`]: true,
        [`${destinationCloud}/sourceUser`]: memberID,
        [`${destinationCloud}/startTimestamp`]: Date.now(),
        [`${destinationCloud}/thumbnail`]: videoInfo.thumbnail,
        ...updateMembers,
      },
      progressUpdates,
      type: 'video',
      filename: videoInfo.id,
      progress: 0,
      updateFirebaseAfterUpload: true,
      date: Date.now(),
      uploadThumbnail: !thumbnailUploaded,
    });
  }
  return snippets;
};

const makeSnippet = async (source, flag) => {
  // source is GFVideo object, flag from makeVideoFlag
  // makeSnippet returns promise that resolves to local URL of snippet
  const {startTime, stopTime, flagTime} = flag;
  if (startTime < 0 || stopTime > source.durationSeconds * 1000) {
    throw 'ERROR: videoManagement.makeSnippet, flag out of range of source video';
  }
  const trimOptions = {
    startTime: startTime / 1000,
    endTime: stopTime / 1000,
  };
  if (!source) {
    return new Promise((resolve) => resolve('simulator'));
    s;
  } else {
    const url = await ProcessingManager.trim(source.url, trimOptions);
    const info = await getVideoInfo(url, true, flagTime);
    // make custom thumbnail here, change above true to false
    return {...info, snippet: true, parent: source.id};
  }
};

const addVideoWithFlags = async (source, flags) => {
  // source is GFVideo object, flags constructed from makeVideoFlags
  let snippets = await Promise.all(
    flags.map((flag) => makeSnippet(source, flag)),
  );
  snippets = snippets.reduce((result, item) => {
    result[item.id] = item;
    return result;
  }, {});
  source.snippets = snippets;
  addVideo(source);
};

const addVideo = async (video) => {
  if (!video.id) video.id = getVideoUUID(video.url);
  await store.dispatch(addVideos({[video.id]: video}));
};

const recordVideo = async () => {
  await store.dispatch(setLayout({isFooterVisible: false}));
  navigate('LocalSession', {screen: 'LocalSession'});
};

const removeVideo = (archive) => {
  const {durationSeconds, thumbnail, url, id, snippet, parent} = archive;
  let onGoBack = async () => {
    await store.dispatch(deleteVideo(id));
    return true;
  };
  if (snippet) {
    onGoBack = async () => {
      await store.dispatch(deleteSnippet({id, parent}));
      return true;
    };
    removeLocalVideo(url);
  }

  navigate('Alert', {
    title: 'Do you want to remove this footage?',
    subtitle: formatDuration(durationSeconds * 1000, true),
    icon: (
      <AsyncImage
        mainImage={thumbnail}
        style={{width: 40, height: 40, borderRadius: 20}}
      />
    ),
    textButton: 'Remove',
    colorButton: 'red',
    onPressColor: colors.redLight,
    onGoBack: () => onGoBack(),
  });
};

const openVideoPlayer = async (video, open, goBack) => {
  await StatusBar.setBarStyle(open ? 'light-content' : 'dark-content', true);
  await store.dispatch(setLayout({isFooterVisible: !open}));
  if (open) return navigate('VideoPlayerPage', {archive: video});
  return goBack();
};

const uploadVideoAlert = (archive) => {
  const userID = store.getState().user.userID;
  const infoUser = store.getState().user.infoUser.userInfo;
  const {durationSeconds, thumbnail, url, id, size, snippet, parent} = archive;
  const destinationCloud = `archivedStreams/${id}`;
  const updateMembers = shareVideoWithMembers(
    {
      [userID]: {id: userID, info: infoUser},
    },
    destinationCloud,
    userID,
    id,
  );

  navigate('Alert', {
    title: 'Do you want to upload this footage?',
    subtitle: formatDuration(durationSeconds * 1000, true),
    icon: (
      <AsyncImage
        mainImage={thumbnail}
        style={{...styleApp.fullSize}}
      />
    ),
    textButton: 'Upload',
    colorButton: 'primary',
    onPressColor: colors.primary,
    onGoBack: async () => {
      if (snippet) {
        await store.dispatch(deleteSnippet({id, parent}));
      } else {
        await store.dispatch(deleteVideo(id));
      }
      await store.dispatch(
        enqueueFileUpload({
          path: url,
          localIdentifier: id,
          id,
          type: 'video',
          thumbnail,
          uploadThumbnail: true,
          durationSeconds,
          progressUpdates: {},
          url,
          storageDestination: destinationCloud,
          firebaseUpdates: {
            [`${destinationCloud}/durationSeconds`]: durationSeconds,
            [`${destinationCloud}/id`]: id,
            [`${destinationCloud}/uploadedByUser`]: true,
            [`${destinationCloud}/sourceUser`]: userID,
            [`${destinationCloud}/size`]: size,
            [`${destinationCloud}/startTimestamp`]: Date.now(),
            [`${destinationCloud}/thumbnail`]: thumbnail,
            ...updateMembers,
          },
          destinationFile: `${destinationCloud}/url`,
          size,
          updateFirebaseAfterUpload: true,
          date: Date.now(),
          progress: 0,
          displayInList: true,
        }),
      );

      return true;
    },
  });
};

const makeVideoFlag = (timestamp, source, maxDuration = 30000) => {
  // timestamp in ms, source is GFVideo object
  const maxMilli = Math.floor(source.durationSeconds * 1000);
  const halfDuration = maxDuration / 2;
  const flag = {
    id: null,
    flagTime: timestamp,
    startTime: timestamp - halfDuration > 0 ? timestamp - halfDuration : 0,
    stopTime:
      timestamp + halfDuration < maxMilli ? timestamp + halfDuration : maxMilli,
  };
  return flag;
};

const removeLocalVideo = async (path) => {
  const filePath = path.split('///').pop(); // removes leading file:///

  RNFS.exists(filePath).then((res) => {
    if (res) {
      RNFS.unlink(filePath).then(() => console.log('FILE DELETED'));
    }
  });
};

const alertStopRecording = (archive) => {
  const userID = store.getState().user.userID;
  const infoUser = store.getState().user.infoUser.userInfo;
  const {durationSeconds, thumbnail, url, id, size, snippet, parent} = archive;

  navigate('Alert', {
    title: `Do you want to upload this footage?`,
    displayList: true,
    subtitle: formatDuration(durationSeconds * 1000, true),
    icon: (
      <AsyncImage
        mainImage={thumbnail}
        style={{width: 40, height: 40, borderRadius: 20}}
      />
    ),
    listOptions: [
      {
        title: 'Upload video',
        operation: () => this.uploadVideo(),
      },
      {
        title: 'Record video',
        forceNavigation: true,
        operation: () => recordVideo(),
      },
      {
        title: 'Cancel',
        forceNavigation: true,
        operation: () => true,
      },
    ],
  });
};

export {
  generateSnippetsFromFlags,
  arrayUploadFromSnippets,
  addVideo,
  removeVideo,
  recordVideo,
  uploadVideoAlert,
  openVideoPlayer,
  addVideoWithFlags,
  makeVideoFlag,
  makeSnippet,
  removeLocalVideo,
  alertStopRecording,
};
