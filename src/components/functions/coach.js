import firebase from 'react-native-firebase';
import {keys} from 'ramda';
import moment from 'moment';

import {generateID} from './createEvent';

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const createCoachSession = async (user) => {
  const coachSessionID = generateID();
  await firebase
    .database()
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
        [user.id]: user,
      },
      allMembers: {[user.id]: true},
    });
  await timeout(1000);
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

const startRecording = (sessionIDFirebase) => {
  firebase
    .database()
    .ref(`coachSessions/${sessionIDFirebase}/tokbox/archiving`)
    .set(true);
};
const stopRecording = (sessionIDFirebase) => {
  firebase
    .database()
    .ref(`coachSessions/${sessionIDFirebase}/tokbox/archiving`)
    .remove();
};

const getMember = (session, userID) => {
  if (!session) return {};
  if (!session.members) return {};
  return session.members[userID];
};

const getLastDrawing = (video) => {
  const drawings = Object.values(video.drawings)
    .sort((a, b) => a.timeStamp - b.timeStamp)
    .reverse();
  console.log('get last drawings: ', drawings);
  return drawings[0];
};

const isUserAdmin = (session, userID) => {
  return userID === session.info.organizer;
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
};
