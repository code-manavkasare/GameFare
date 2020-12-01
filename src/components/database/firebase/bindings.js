import database from '@react-native-firebase/database';
import moment from 'moment';
import RnBgTask from 'react-native-bg-thread';
import equal from 'fast-deep-equal';
import isEqual from 'lodash.isequal';

import {store} from '../../../store/reduxStore';
import {setSession} from '../../../store/actions/coachSessionsActions';
import {setConversation} from '../../../store/actions/conversationsActions';
import {setArchive} from '../../../store/actions/archivesActions';
import {setClub} from '../../../store/actions/clubsActions';

const bindSession = (sessionID) => {
  RnBgTask.runInBackground(() => {
    database()
      .ref(`coachSessions/${sessionID}`)
      .on('value', function(snapshot) {
        const newSession = snapshot.val();
        if (newSession) store.dispatch(setSession(newSession));
      });
  });
};

const unbindSession = async (sessionID) => {
  await database()
    .ref(`coachSessions/${sessionID}`)
    .off();
};

const bindClub = (objectID) => {
  RnBgTask.runInBackground(() => {
    database()
      .ref(`clubs/${objectID}`)
      .on('value', function(snapshot) {
        const newClub = snapshot.val();
        const currentClub = store.getState().clubs[objectID];
        if (newClub && !isEqual(currentClub, newClub))
          store.dispatch(setClub(newClub));
      });
  });
};

const unbindClub = async (objectID) => {
  await database()
    .ref(`clubs/${objectID}`)
    .off();
};

const bindArchive = (archiveID) => {
  RnBgTask.runInBackground(() => {
    database()
      .ref('archivedStreams/' + archiveID)
      .on('value', async function(snap) {
        const firebaseArchive = snap.val();
        const newArchive = {
          ...firebaseArchive,
          id: archiveID,
        };
        const prevArchive = store.getState().archives[archiveID];
        if (!equal(prevArchive, newArchive))
          await store.dispatch(setArchive(newArchive));
      });
  });
};

const unbindArchive = async (archiveID) => {
  database()
    .ref('archivedStreams/' + archiveID)
    .off();
};

const bindConversation = (conversationID) => {
  const gamefareUser = store.getState().message.gamefareUser;

  RnBgTask.runInBackground(() => {
    database()
      .ref(`messagesCoachSession/${conversationID}`)
      .on('value', async function(snap) {
        let messages = snap.val();
        if (!messages) {
          messages = {
            ['noMessage']: {
              user: gamefareUser,
              text: 'Write the first message.',
              createdAt: new Date(),
              id: 'noMessage',
              timeStamp: moment().valueOf(),
            },
          };
        }
        messages = Object.keys(messages)
          .map((id) => ({
            id,
            ...messages[id],
          }))
          .sort((a, b) => a.timeStamp - b.timeStamp)
          .reverse()
          .reduce(function(result, item) {
            result[item.id] = item;
            return result;
          }, {});
        const prevConversation = store.getState().conversations[conversationID];
        const newConversation = {messages, objectID: conversationID};
        if (!equal(prevConversation, newConversation))
          store.dispatch(setConversation(newConversation));
      });
  });
};

const unbindConversation = async (conversationID) => {
  await database()
    .ref('messagesCoachSession/' + conversationID)
    .off();
};

export {
  bindSession,
  unbindSession,
  bindArchive,
  unbindArchive,
  bindConversation,
  unbindConversation,
  bindClub,
  unbindClub,
};
