import {
  HIDE_FOOTER_APP,
  RESET_COACH_DATA,
  RESET_USER_INFO,
  RESET_USER_MESSAGES,
  SET_ARCHIVE_FIREBASE_BIND_STATUS,
  SET_LAYOUT_SETTINGS,
  SET_USER_INFO,
} from './types';

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import Mixpanel from 'react-native-mixpanel';

import {resetDataCoachSession} from './coachActions';
import {setArchive} from './archivesActions';

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

const setArchiveFirebaseBindStatus = (id, isBinded) => ({
  type: SET_ARCHIVE_FIREBASE_BIND_STATUS,
  archiveId: id,
  isBindedToFirebase: isBinded,
});

// const resetDataCoachSession = () => ({
//   type: RESET_COACH_DATA,
// });

var infoUserToPushSaved = '';

export const userAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'signIn') {
      const user = await auth().signInWithCustomToken(data.firebaseSignInToken);
      const userID = user.user.uid;
      await subscribeToTopics([userID]);

      Mixpanel.identify(userID);
      Mixpanel.set({userID: userID});

      return database()
        .ref('users/' + userID)
        .on('value', function(snap) {
          console.log('user info updated');
          var infoUser = snap.val();
          console.log('infoUserarchive: ', infoUser.archivedStreams);

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

          for (const archiveInfo of Object.values(infoUser.archivedStreams)) {
            database()
              .ref(`archivedStreams/${archiveInfo.id}`)
              .on('value', function(snap) {
                const archive = snap.val();
                dispatch(setArchive(archive));
                dispatch(setArchiveFirebaseBindStatus(archive.id, true));
              });
          }

          if (infoUserToPushSaved !== infoUserToPush) {
            infoUserToPushSaved = infoUserToPush;
            dispatch(setUserInfo(infoUserToPush));
          }
          return userConnected;
        });
    } else if (val === 'logout') {
      await messaging().unsubscribeFromTopic(data.userID);
      await database()
        .ref('users/' + data.userID)
        .off('value');
      await dispatch(resetDataCoachSession());
      await dispatch(resetUserInfo());
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
