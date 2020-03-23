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

module.exports = {
  createCoachSession,
  timeout,
};
