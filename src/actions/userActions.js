import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import Mixpanel from 'react-native-mixpanel';
import {mergeDeepLeft} from 'ramda';

import {
  HIDE_FOOTER_APP,
  RESET_USER_INFO,
  RESET_USER_MESSAGES,
  SET_ARCHIVE_FIREBASE_BIND_STATUS,
  SET_COACH_SESSION_FIREBASE_BIND_STATUS,
  SET_LAYOUT_SETTINGS,
  SET_USER_INFO,
} from './types';

import {store} from '../../reduxStore.js';
import {resetDataCoachSession} from './coachActions';
import {resetArchives, setArchive} from './archivesActions.js';
import {resetSessions, setSession} from './coachSessionsActions.js';

import {subscribeToTopics} from '../components/functions/notifications';
const mixPanelToken = 'f850115393f202af278e9024c2acc738';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

const setUserInfo = (value) => ({
  type: SET_USER_INFO,
  userInfo: value,
});

const resetUserInfo = () => ({
  type: RESET_USER_INFO,
});

const resetMessages = () => ({
  type: RESET_USER_MESSAGES,
});

const setLayoutSettings = (value) => ({
  type: SET_LAYOUT_SETTINGS,
  layoutSettings: value,
});

const hideFooterApp = () => ({
  type: HIDE_FOOTER_APP,
});

const setArchiveFirebaseBindStatus = (id, isBind) => ({
  type: SET_ARCHIVE_FIREBASE_BIND_STATUS,
  archiveId: id,
  isBindToFirebase: isBind,
});

const setCoachSessionFirebaseBindStatus = (id, isBind) => ({
  type: SET_COACH_SESSION_FIREBASE_BIND_STATUS,
  coachSessionId: id,
  isBindToFirebase: isBind,
});

var infoUserToPushSaved = '';

const filterArchivesBindToFirebase = (archives) => {
  const archivesFromStore = store.getState().user.infoUser.archivedStreams;
  if (!archivesFromStore && archives) {
    return archives;
  }
  if (!archivesFromStore && !archives) {
    return {};
  }

  let filteredArchives = {};
  for (const archive of Object.values(archives)) {
    const archiveFromStore = {...archivesFromStore[archive.id]};
    if (archiveFromStore) {
      filteredArchives[archive.id] = mergeDeepLeft(archive, archiveFromStore);
    }
  }
  return filteredArchives;
};

const filterCoachSessionBindToFirebase = (coachSessions) => {
  const coachSessionsFromStore = store.getState().user.infoUser.coachSessions;
  if (!coachSessionsFromStore && coachSessions) {
    return coachSessions;
  }
  if (!coachSessionsFromStore && !coachSessions) {
    return {};
  }

  let filteredCoachSessions = {};
  for (const coachSession of Object.values(coachSessions)) {
    const coachSessionFromStore = {...coachSessionsFromStore[coachSession.id]};
    if (coachSessionFromStore) {
      filteredCoachSessions[coachSession.id] = mergeDeepLeft(
        coachSession,
        coachSessionFromStore,
      );
    }
  }
  return filteredCoachSessions;
};

const userAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'signIn') {
      const user = await auth().signInWithCustomToken(data.firebaseSignInToken);
      const userID = user.user.uid;
      await subscribeToTopics([userID]);

      Mixpanel.identify(userID);
      Mixpanel.set({userID: userID});

      return database()
        .ref('users/' + userID)
        .on('value', async function(snap) {
          var infoUser = snap.val();

          infoUser.archivedStreams = await filterArchivesBindToFirebase(
            infoUser.archivedStreams,
          );

          infoUser.coachSessions = await filterCoachSessionBindToFirebase(
            infoUser.coachSessions,
          );

          var userConnected = false;
          var userIDSaved = '';
          if (infoUser.profileCompleted) {
            userConnected = true;
            userIDSaved = userID;
          }
          var wallet = infoUser.wallet;
          wallet.transfers = [];
          infoUser.wallet = wallet;
          const infoUserToPush = {
            userID: userID,
            infoUser: infoUser,
            userConnected: userConnected,
            phoneNumber: data.phoneNumber,
            countryCode: data.countryCode,
            userIDSaved: userIDSaved,
          };

          if (infoUserToPushSaved !== infoUserToPush) {
            infoUserToPushSaved = infoUserToPush;
            dispatch(setUserInfo(infoUserToPush));
          }

          if (infoUser.archivedStreams) {
            for (const archiveInfo of Object.values(infoUser.archivedStreams)) {
              const archiveInfoFromStore = store.getState().user.infoUser
                .archivedStreams[archiveInfo.id];
              if (!archiveInfoFromStore.isBindToFirebase) {
                database()
                  .ref(`archivedStreams/${archiveInfo.id}`)
                  .on('value', function(snapshot) {
                    const archive = snapshot.val();
                    dispatch(setArchive(archive));

                    const archiveInfoFromStore = store.getState().user.infoUser
                      .archivedStreams[archiveInfo.id];
                    if (!archiveInfoFromStore.isBindToFirebase) {
                      dispatch(setArchiveFirebaseBindStatus(archive.id, true));
                    }
                  });
              }
            }
          }

          if (infoUser.coachSessions) {
            for (const coachSession of Object.values(infoUser.coachSessions)) {
              const coachSessionFromStore = store.getState().user.infoUser
                .coachSessions[coachSession.id];
              if (!coachSessionFromStore.isBindToFirebase) {
                database()
                  .ref(`coachSessions/${coachSession.id}`)
                  .on('value', function(snapshot) {
                    const coachSessionFirebase = snapshot.val();
                    dispatch(setSession(coachSessionFirebase));

                    const coachSessionFromStore = store.getState().user.infoUser
                      .coachSessions[coachSession.id];
                    if (!coachSessionFromStore.isBindToFirebase) {
                      dispatch(
                        setCoachSessionFirebaseBindStatus(
                          coachSession.id,
                          true,
                        ),
                      );
                    }
                  });
              }
            }
          }

          return userConnected;
        });
    } else if (val === 'logout') {
      await messaging().unsubscribeFromTopic(data.userID);
      await database()
        .ref('users/' + data.userID)
        .off('value');
      await dispatch(resetUserInfo());
      await dispatch(resetDataCoachSession());
      await dispatch(resetArchives());
      await dispatch(resetSessions());
      await dispatch(resetMessages());

      return true;
    } else if (val === 'setLayoutSettings') {
      return dispatch(setLayoutSettings(data));
    } else if (val === 'hideFooterApp') {
      return dispatch(hideFooterApp());
    }
    return true;
  };
};

export {
  userAction,
  setArchiveFirebaseBindStatus,
  setCoachSessionFirebaseBindStatus,
};
