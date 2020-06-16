import database from '@react-native-firebase/database';
import {createThumbnail} from 'react-native-create-thumbnail';
import RNFS from 'react-native-fs';

import colors from '../style/colors';
import {heightCardSession} from '../style/sizes';

import {generateID} from './createEvent';

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const infoCameraResolution = () => {};

const createCoachSession = async (user) => {
  const coachSessionID = generateID();
  await database()
    .ref('coachSessions/' + coachSessionID)
    .update({
      objectID: coachSessionID,
      tokbox: {
        sessionID: false,
        sessionIsCreated: false,
      },
      info: {
        organizer: user.id,
      },
      members: {
        [user.id]: {...user, isConnected: false},
      },
      allMembers: {[user.id]: true},
    });
  return coachSessionID;
};

const isUserAlone = (session) => {
  if (!session) return null;
  if (!session.members) return true;
  return (
    Object.values(session.members).filter((member) => member.isConnected)
      .length <= 1
  );
};

const isSomeoneSharingScreen = (session) => {
  if (!session) return false;
  if (!session.members) return false;
  if (
    Object.values(session.members).filter(
      (member) => member.isConnected && member.shareScreen,
    ).length > 0
  )
    return Object.values(session.members).filter(
      (member) => member.isConnected && member.shareScreen,
    )[0].id;
  return false;
};

const userPartOfSession = (session, userID) => {
  if (!session) return false;
  if (!session.allMembers) return false;
  if (!session.allMembers[userID]) return false;
  return session.members[userID];
};

const minutes = (time) => {
  return Math.floor(time / 60);
};

const seconds = (time, displayMilliseconds) => {
  let sec = (time % 60).toFixed(0);
  if (displayMilliseconds) sec = Math.floor(time % 60).toFixed(0);
  if (sec.length === 1) return '0' + sec;
  return sec;
};

const milliSeconds = (time) => {
  const min = minutes(time) * 60;
  const sec = Math.floor(time % 60);
  let ms = Number(((time - (min + sec)) * 100).toFixed(0));

  if (ms.toString().length === 1) return '0' + ms;
  if (ms === 100) return '00';
  if (ms === 0) return '00';
  return ms;
};

const displayTime = (time, displayMilliseconds) => {
  if (displayMilliseconds)
    return (
      minutes(time) +
      ':' +
      seconds(time, displayMilliseconds) +
      ':' +
      milliSeconds(time)
    );

  return minutes(time) + ':' + seconds(time);
};

const startRecording = (sessionIDFirebase, streamMemberId) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/tokbox/recordingStreamId`
  ] = streamMemberId;
  updates[`coachSessions/${sessionIDFirebase}/tokbox/archiving`] = true;
  database()
    .ref()
    .update(updates);
};
const stopRecording = (sessionIDFirebase) => {
  let updates = {};
  updates[`coachSessions/${sessionIDFirebase}/tokbox/archiving`] = null;
  updates[`coachSessions/${sessionIDFirebase}/tokbox/recordingStreamId`] = null;
  database()
    .ref()
    .update(updates);
};

const updateTimestamp = (sessionIDFirebase, memberID, timestamp) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/startTimestamp`
  ] = timestamp;
  database()
    .ref()
    .update(updates);
};

const startRemoteRecording = (memberID, sessionIDFirebase, selfID) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/isRecording`
  ] = true;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/startTimestamp`
  ] = Date.now();
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/userIDrequesting`
  ] = selfID;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/flags`
  ] = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/uploadRequest`
  ] = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/thumbnail`
  ] = null;

  database()
    .ref()
    .update(updates);
};

const stopRemoteRecording = (memberID, sessionIDFirebase) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/isRecording`
  ] = false;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/stopTimestamp`
  ] = Date.now();
  database()
    .ref()
    .update(updates);
};

const getMember = (session, userID) => {
  if (!session) return {};
  if (!session.members) return {};
  return session.members[userID];
};

const getLastDrawing = (drawings) => {
  if (!drawings) return false;
  return Object.values(drawings)
    .sort((a, b) => a.timeStamp - b.timeStamp)
    .reverse()[0];
};

const isUserAdmin = (organizerID, userID) => {
  return userID === organizerID;
};

const isEven = (n) => {
  return !(n & 1);
};

const styleStreamView = (
  index,
  coordinates,
  pageFullScreen,
  currentScreenSize,
) => {
  let styleContainerStreamView = {
    marginTop: 0,
    width: currentScreenSize.currentWidth,
    overflow: 'hidden',
    borderRadius: 0,
    height: heightCardSession,
  };
  let styleCard = {
    height: '100%',
    width: '100%',
    position: 'relative',
  };
  if (pageFullScreen) {
    styleCard = {
      position: 'absolute',
      height: currentScreenSize.currentHeight,
      width: currentScreenSize.currentWidth,
      top: 0,
      backgroundColor: colors.greyDark,
    };
    styleContainerStreamView = {
      position: 'absolute',
      zIndex: 50,
      top: -coordinates.y,
      left: -coordinates.x,
      height: currentScreenSize.currentHeight,
      width: currentScreenSize.currentWidth,
      borderRadius: 10,
      // backgroundColor: colors.red,
    };
  }
  return {styleContainerStreamView, styleCard};
};

const getVideoSharing = (session, personSharingScreen) => {
  if (!session) return false;
  if (!personSharingScreen) return false;

  const {videoIDSharing} = session.members[personSharingScreen];
  if (!session.sharedVideos) return false;
  return session.sharedVideos[videoIDSharing];
};

const getVideoUUID = (path) => {
  if (!path) return 'simulator';
  const videoUUID = path
    ? path.split('/')[path.split('/').length - 1].split('.')[0]
    : generateID();
  return videoUUID;
};

const generateFlagsThumbnail = async ({
  flags,
  source,
  memberID,
  coachSessionID,
}) => {
  let thumbnails = [];
  if (flags) {
    for (var i in flags) {
      const flag = flags[i];
      const flagID = flag.id;
      const thumbnail = await createThumbnail({
        url: source,
        timeStamp: flag.time,
      });

      thumbnails.push({
        path: thumbnail.path,
        localIdentifier: getVideoUUID(thumbnail.path),
        storageDestination: `coachSessions/${coachSessionID}/members/${memberID}/recording/flags/${flagID}/thumbnail`,
        destinationFile: `coachSessions/${coachSessionID}/members/${memberID}/recording/flags/${flagID}/thumbnail`,
        firebaseUpdates: {},
        displayInList: true,
        progress: 0,
        type: 'image',
        filename: 'thumbnail',
        updateFirebaseAfterUpload: true,
        date: Date.now(),
      });
    }
  }
  const thumbnailFullVideo = await createThumbnail({
    url: source,
    timeStamp: 500,
  });
  thumbnails.push({
    path: thumbnailFullVideo.path,
    localIdentifier: getVideoUUID(thumbnailFullVideo.path),
    storageDestination: `coachSessions/${coachSessionID}/members/${memberID}/recording/thumbnail`,
    destinationFile: `coachSessions/${coachSessionID}/members/${memberID}/recording/thumbnail`,
    firebaseUpdates: {},
    filename: 'thumbnail',
    displayInList: true,
    progress: 0,
    type: 'image',
    updateFirebaseAfterUpload: true,
    date: Date.now(),
  });
  await database()
    .ref()
    .update({
      [`coachSessions/${coachSessionID}/members/${memberID}/recording/localSource`]: source,
    });

  console.log('generate thumbanuls', thumbnails);
  return thumbnails;
};

module.exports = {
  createCoachSession,
  timeout,
  isUserAlone,
  isSomeoneSharingScreen,
  getLastDrawing,
  userPartOfSession,
  displayTime,
  startRecording,
  stopRecording,
  getMember,
  isUserAdmin,
  isEven,
  styleStreamView,
  getVideoSharing,
  startRemoteRecording,
  stopRemoteRecording,
  updateTimestamp,
  generateFlagsThumbnail,
  getVideoUUID,
};
