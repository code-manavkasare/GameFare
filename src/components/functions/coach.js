import firebase from 'react-native-firebase';
import {keys} from 'ramda';
import moment from 'moment';

import {generateID} from './createEvent';

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

const isSomeoneSharingScreen = (session, userID) => {
  if (!session) return false;
  if (!session.members) return false;
  return (
    Object.values(session.members).filter(
      (member) =>
        member.id !== userID && member.isConnected && member.shareScreen,
    ).length > 0
  );
};

const getLastDrawing = (video) => {
  const drawings = Object.values(video.drawings)
    .sort((a, b) => a.timeStamp - b.timeStamp)
    .reverse();
  console.log('get last drawings: ', drawings);
  return drawings[0];
};

module.exports = {
  createCoachSession,
  timeout,
  isUserAlone,
  isSomeoneSharingScreen,
  getLastDrawing,
};
