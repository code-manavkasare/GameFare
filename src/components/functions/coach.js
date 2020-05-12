import database from '@react-native-firebase/database';

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

const seconds = (time) => {
  const sec = (time % 60).toFixed(0);
  if (sec.length === 1) return '0' + sec;
  return sec;
};

const displayTime = (time) => {
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

const getMember = (session, userID) => {
  if (!session) return {};
  if (!session.members) return {};
  return session.members[userID];
};

const getLastDrawing = (video) => {
  if (!video.drawings) return false;
  const drawings = Object.values(video.drawings)
    .sort((a, b) => a.timeStamp - b.timeStamp)
    .reverse();
  return drawings[0];
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
      backgroundColor: colors.transparentGrey,
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
};
