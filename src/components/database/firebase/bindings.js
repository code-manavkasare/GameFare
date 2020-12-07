import database from '@react-native-firebase/database';
import moment from 'moment';
import RnBgTask from 'react-native-bg-thread';
import equal from 'fast-deep-equal';
import isEqual from 'lodash.isequal';

import {store} from '../../../store/reduxStore';
import {setSession} from '../../../store/actions/coachSessionsActions';
import {setConversation} from '../../../store/actions/conversationsActions';
import {setArchive} from '../../../store/actions/archivesActions';
import {setClubs} from '../../../store/actions/clubsActions';
import {setBookings} from '../../../store/actions/bookingsActions';
import {setServices} from '../../../store/actions/servicesActions';
import {setPosts} from '../../../store/actions/postsActions';
import {setUsers} from '../../../store/actions/usersActions';

const bindSession = (sessionID) => {
  RnBgTask.runInBackground(() => {
    database()
      .ref(`coachSessions/${sessionID}`)
      .on('value', function(snapshot) {
        const newSession = snapshot.val();
        console.log('bindSession', newSession);
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
          store.dispatch(setClubs({[objectID]: newClub}));
      });
  });
};

const unbindClub = async (objectID) => {
  await database()
    .ref(`clubs/${objectID}`)
    .off();
};

const bindPost = (objectID) => {
  RnBgTask.runInBackground(() => {
    database()
      .ref(`posts/${objectID}`)
      .on('value', function(snapshot) {
        const newPost = snapshot.val();
        const currentPost = store.getState().posts[objectID];
        if (newPost && !isEqual(currentPost, newPost))
          store.dispatch(setPosts({[objectID]: newPost}));
      });
  });
};

const unbindPost = async (objectID) => {
  await database()
    .ref(`posts/${objectID}`)
    .off();
};

const bindUserInfo = (objectID) => {
  RnBgTask.runInBackground(() => {
    database()
      .ref(`users/${objectID}/userInfo`)
      .on('value', function(snapshot) {
        const newUser = snapshot.val();
        const currentUser = store.getState().users[objectID];
        if (newUser && !isEqual(currentUser, newUser))
          store.dispatch(setUsers({[objectID]: newUser}));
      });
  });
};

const unbindUserInfo = async (objectID) => {
  await database()
    .ref(`users/${objectID}/userInfo`)
    .off();
};

const bindService = (objectID) => {
  RnBgTask.runInBackground(() => {
    database()
      .ref(`services/${objectID}`)
      .on('value', function(snapshot) {
        const newService = snapshot.val();
        const currentService = store.getState().services[objectID];
        if (newService && !isEqual(currentService, newService))
          store.dispatch(setServices({[objectID]: newService}));
      });
  });
};

const unbindService = async (objectID) => {
  await database()
    .ref(`services/${objectID}`)
    .off();
};

const bindBooking = (objectID) => {
  RnBgTask.runInBackground(() => {
    database()
      .ref(`bookings/${objectID}`)
      .on('value', function(snapshot) {
        const newBooking = snapshot.val();
        const currentBooking = store.getState().bookings[objectID];
        if (newBooking && !isEqual(currentBooking, newBooking))
          store.dispatch(setBookings({[objectID]: newBooking}));
      });
  });
};

const unbindBooking = async (objectID) => {
  await database()
    .ref(`bookings/${objectID}`)
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
  bindService,
  unbindService,
  bindBooking,
  unbindBooking,
  bindPost,
  unbindPost,
  bindUserInfo,
  unbindUserInfo,
};
