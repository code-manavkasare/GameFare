import database from '@react-native-firebase/database';
import moment from 'moment';
import RnBgTask from 'react-native-bg-thread';
import equal from 'fast-deep-equal';

import {store} from '../../../store/reduxStore';
import {setSession} from '../../../store/actions/coachSessionsActions';
import {setConversation} from '../../../store/actions/conversationsActions';
import {setArchive} from '../../../store/actions/archivesActions';

const bindSession = (sessionID) => {
  const prevSession = store.getState().archives[sessionID];
  if (!prevSession?.isBinded)
    RnBgTask.runInBackground(() => {
      database()
        .ref(`coachSessions/${sessionID}`)
        .on('value', function(snapshot) {
          const coachSessionFirebase = snapshot.val();
          if (!equal(prevSession, coachSessionFirebase))
            store.dispatch(setSession({...snapshot.val(), isBinded: true}));
        });
    });
};

const unbindSession = async (sessionID) => {
  await database()
    .ref(`coachSessions/${sessionID}`)
    .off();
};

const bindArchive = (archiveID) => {
  const prevArchive = store.getState().archives[archiveID];
  if (!prevArchive?.isBinded) {
    RnBgTask.runInBackground(() => {
      database()
        .ref('archivedStreams/' + archiveID)
        .on('value', async function(snap) {
          const firebaseArchive = snap.val();
          const newArchive = {
            ...firebaseArchive,
            id: archiveID,
            localUrlCreated: false,
          };
          if (!equal(prevArchive, newArchive))
            await store.dispatch(setArchive({...newArchive, isBinded: true}));
        });
    });
  }
};

const unbindArchive = async (archiveID) => {
  database()
    .ref('archivedStreams/' + archiveID)
    .off();
};

const bindConversation = (conversationID) => {
  const gamefareUser = store.getState().message.gamefareUser;

  const prevConversation = store.getState().conversations[conversationID];
  if (!prevConversation?.isBinded)
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
};
