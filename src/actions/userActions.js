import {
  SET_USER_INFO,
  RESET_USER_INFO,
  RESET_USER_MESSAGES,
  SET_LAYOUT_SETTINGS,
  HIDE_FOOTER_APP,
} from './types';

import firebase from 'react-native-firebase';
import Mixpanel from 'react-native-mixpanel';
const mixPanelToken = 'f850115393f202af278e9024c2acc738';

import {subscribeToTopics} from '../components/functions/notifications';
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

var infoUserToPushSaved = '';

export const userAction = (val, data) => {
  return async function (dispatch) {
    if (val === 'signIn') {
      const user = await firebase
        .auth()
        .signInWithCustomToken(data.firebaseSignInToken);
      const userID = user.user.uid;
      await subscribeToTopics([userID]);

      Mixpanel.identify(userID);
      Mixpanel.set({userID: userID});

      return firebase
        .database()
        .ref('users/' + userID)
        .on('value', function (snap) {
          var infoUser = snap.val();

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
          return userConnected;
        });
    } else if (val === 'logout') {
      await firebase.messaging().unsubscribeFromTopic(data.userID);
      await firebase
        .database()
        .ref('users/' + data.userID)
        .off('value');
      await dispatch(resetUserInfo());
      await dispatch(resetMessages());
      return true;
    } else if (val === 'setLayoutSettings') {
      console.log('setLayoutSettings');
      return dispatch(setLayoutSettings(data));
    } else if (val === 'hideFooterApp') {
      console.log('hideFooterApp');
      return dispatch(hideFooterApp());
    }
    return true;
  };
};
