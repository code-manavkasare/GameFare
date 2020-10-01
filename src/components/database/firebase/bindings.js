// Note:
//   The functions in here are not meant to be used directly. If a component needs
//   to bind one of these objects from firebase it should use the corresponding redux
//   action, i.e. -- coachSessionsAction('bindSession', sessionID) for binding a session.
//   This pattern can be seen in a component like CardArchive or CardStreamView, where the
//   bind action is sent on componentDidMount, and the unbind action is sent on componentWillUnmount.
//
//   There are corresponding Manager components that call these functions in response to the redux store,
//   rendered in App.js.


import database from '@react-native-firebase/database';
import moment from 'moment';

import {store} from '../../../../reduxStore';
import {setSession} from '../../../actions/coachSessionsActions';
import {setConversation} from '../../../actions/conversationsActions';
import {setArchive, deleteArchive} from '../../../actions/archivesActions';

import {getArchiveByID, cacheArchive} from '../../functions/archive';

const bindSession = (sessionID) => {
  database()
    .ref(`coachSessions/${sessionID}`)
    .on('value', function(snapshot) {
      const coachSessionFirebase = snapshot.val();
      if (coachSessionFirebase) {
        store.dispatch(setSession(coachSessionFirebase));
      }
    });
};

const unbindSession = async (sessionID) => {
  await database()
    .ref(`coachSessions/${sessionID}`)
    .off();
};


const bindArchive = (archiveID) => {
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
            localUrlCreated: storeArchive?.localUrlCreated
              ? storeArchive.localUrlCreated
              : false,
          }),
        );
        if (!storeArchive?.localUrlCreated) {
          cacheArchive(archiveID);
        }
      } else {
        store.dispatch(deleteArchive(archiveID));
      }
    });
};

const unbindArchive = async (archiveID) => {
  database()
    .ref('archivedStreams/' + archiveID)
    .off();
};


const bindConversation = (conversationID) => {
  const gamefareUser = store.getState().message.gamefareUser;
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
}