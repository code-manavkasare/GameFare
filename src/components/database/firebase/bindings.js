import database from '@react-native-firebase/database';
import moment from 'moment';

import {store} from '../../../store/reduxStore';
import {
  setSession,
  setSessionBinded,
} from '../../../store/actions/coachSessionsActions';
import {
  setConversation,
  setConversationBinded,
} from '../../../store/actions/conversationsActions';
import {
  setArchive,
  setArchiveBinded,
} from '../../../store/actions/archivesActions';

import {getArchiveByID, cacheArchive} from '../../functions/archive';
import {deleteVideos} from '../../functions/videoManagement';
import equal from 'fast-deep-equal';

const bindSession = (sessionID) => {
  const isSessionBinded = store.getState().bindedSessions[sessionID];
  if (!isSessionBinded)
    database()
      .ref(`coachSessions/${sessionID}`)
      .on('value', function(snapshot) {
        const coachSessionFirebase = snapshot.val();
        if (coachSessionFirebase) {
          const prevSession = store.getState().coachSessions[sessionID];
          if (!equal(prevSession, coachSessionFirebase))
            store.dispatch(setSession(coachSessionFirebase));
          const prevSessionBinded = store.getState().bindedSessions[sessionID];
          if (!prevSessionBinded)
            store.dispatch(setSessionBinded(sessionID, true));
        }
      });
};

const unbindSession = async (sessionID) => {
  await database()
    .ref(`coachSessions/${sessionID}`)
    .off();
  store.dispatch(setSessionBinded(sessionID, false));
};

const bindArchive = (archiveID) => {
  const isArchiveBinded = store.getState().bindedArchives[archiveID];
  console.log('bindArchive', archiveID);
  if (!isArchiveBinded)
    database()
      .ref('archivedStreams/' + archiveID)
      .on('value', async function(snap) {
        const firebaseArchive = snap.val();
        if (firebaseArchive) {
          const storeArchive = getArchiveByID(archiveID);

          const newArchive = {
            ...firebaseArchive,
            id: archiveID,
            url: storeArchive?.localUrlCreated
              ? storeArchive.url
              : firebaseArchive.url,
            originalUrl: firebaseArchive.url,
            localUrlCreated: storeArchive?.localUrlCreated
              ? storeArchive.localUrlCreated
              : false,
          };
          if (!equal(storeArchive, newArchive))
            await store.dispatch(setArchive(newArchive));
          const prevArchiveBinded = store.getState().bindedArchives[archiveID];
          if (!prevArchiveBinded)
            store.dispatch(setArchiveBinded(archiveID, true));

          if (!storeArchive?.localUrlCreated) {
            cacheArchive(archiveID);
          }
        } else {
          deleteVideos([archiveID]);
        }
      });
};

const unbindArchive = async (archiveID) => {
  database()
    .ref('archivedStreams/' + archiveID)
    .off();
  store.dispatch(setArchiveBinded(archiveID, false));
};

const bindConversation = (conversationID) => {
  const gamefareUser = store.getState().message.gamefareUser;

  const isConversationBinded = store.getState().bindedConversations[
    conversationID
  ];
  if (!isConversationBinded)
    database()
      .ref('messagesCoachSession/' + conversationID)
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

        const storeConversation = store.getState().conversations[
          conversationID
        ];
        if (!equal(storeConversation, {messages, objectID: conversationID}))
          store.dispatch(setConversation({messages, objectID: conversationID}));
        const prevConversationBinded = store.getState().bindedConversations[
          conversationID
        ];
        if (!prevConversationBinded)
          store.dispatch(setConversationBinded(conversationID, true));
      });
};

const unbindConversation = async (conversationID) => {
  await database()
    .ref('messagesCoachSession/' + conversationID)
    .off();
  store.dispatch(setConversationBinded(conversationID, false));
};

export {
  bindSession,
  unbindSession,
  bindArchive,
  unbindArchive,
  bindConversation,
  unbindConversation,
};
