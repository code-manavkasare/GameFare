import {ProcessingManager} from 'react-native-video-processing';
import {createThumbnail} from 'react-native-create-thumbnail';
import {uploadImage} from '../functions/upload';
import database from '@react-native-firebase/database';

import {generateID} from './createEvent';
import {getVideoInfo, getVideoUUID} from './pictures';

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
    updates[`users/${memberID}/archivedStreams/uploading/${videoID}`] = {}
  });
  return updates;
};

const generateProgressUpdates = (members, userID, videoID, thumbnail, durationSeconds, index) => {
  console.log('generating updates', thumbnail)
  let constructor = {};
  let uploadPaths = [];
  Object.values(members).map((member) => {
    const memberID = member.id
    const timeStamp = Date.now()
    let path = `users/${memberID}/archivedStreams/uploading/${videoID}`
    constructor[path] = {
      filename: videoID,
      hostUser: userID,
      thumbnail,
      durationSeconds,
      date: Date.now(),
      progress: 0,
      index
    }
    uploadPaths.push(path)
  })
  database()
    .ref()
    .update(constructor);
  return {
    constructor,
    uploadPaths
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
      let thumbnailUploaded = (thumbnail && thumbnail.substring(0,4) === "http") ? true : false;
      let videoInfo = await getVideoInfo(snippetLocalPath, !thumbnailUploaded);
      console.log('videoInfo', videoInfo)
      const destinationCloud = `archivedStreams/${videoInfo.id}`;
      if (thumbnailUploaded) {
        videoInfo.thumbnail = thumbnail
      } else if (videoInfo.thumbnail) {
        console.log(videoInfo.thumbnail)
        videoInfo.thumbnail = await uploadImage(
          'file:///' + videoInfo.thumbnail,
          destinationCloud,
          'thumbnail.jpg'
        )
        thumbnailUploaded = true
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
        index
      )
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
      videoInfo.thumbnail = thumbnail
    } else if (videoInfo.thumbnail) {
      console.log(videoInfo.thumbnail)
      videoInfo.thumbnail = await uploadImage(
        'file:///' + videoInfo.thumbnail,
        destinationCloud,
        'thumbnail.jpg'
      )
      thumbnailUploaded = true
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
      index
    )
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
  console.log('snippets', snippets);
  return snippets;
};

const addVideo = async (video) => {
  if (!video.id) video.id = getVideoUUID(video.url);
  await store.dispatch(addVideos({[video.id]: video}));
};

const recordVideo = async () => {
  await store.dispatch(setLayout({isFooterVisible: false}));
  navigate('LocalSession', {screen: 'LocalSession'});
};

const removeVideo = (videoID) => {
  return store.dispatch(deleteVideo(videoID));
};

export {
  generateSnippetsFromFlags,
  arrayUploadFromSnippets,
  addVideo,
  removeVideo,
  recordVideo,
};
