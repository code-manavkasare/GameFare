import database from '@react-native-firebase/database';
import moment from 'moment';

import {store} from '../../../../reduxStore';
import {
  setSession,
  setSessionBinded,
} from '../../../actions/coachSessionsActions';
import {
  setConversation,
  setConversationBinded,
} from '../../../actions/conversationsActions';
import {setArchive, setArchiveBinded} from '../../../actions/archivesActions';

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
          store.dispatch(setSession(coachSessionFirebase));
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
          await store.dispatch(
            setArchive({
              ...firebaseArchive,
              id: archiveID,
              url: storeArchive?.localUrlCreated
                ? storeArchive.url
                : firebaseArchive.url,
              originalUrl: firebaseArchive.url,
              localUrlCreated: storeArchive?.localUrlCreated
                ? storeArchive.localUrlCreated
                : false,
            }),
          );
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
        store.dispatch(setConversation({messages, objectID: conversationID}));
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
