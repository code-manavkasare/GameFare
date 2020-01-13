import {SET_USER_INFO, RESET_USER_INFO} from './types';

import firebase from 'react-native-firebase';
import Mixpanel from 'react-native-mixpanel';
const mixPanelToken = 'f850115393f202af278e9024c2acc738';
import NavigationService from '../../NavigationService';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

const setUserInfo = (value) => ({
  type: SET_USER_INFO,
  userInfo: value,
});

const resetUserInfo = () => ({
  type: RESET_USER_INFO,
});

var infoUserToPushSaved = '';

export const userAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'signIn') {
      var user = await firebase
        .auth()
        .signInWithCustomToken(data.firebaseSignInToken);
      var userID = user.user.uid;
      Mixpanel.identify(userID);
      Mixpanel.set({userID: userID});
      return firebase
        .database()
        .ref('users/' + userID)
        .on('value', function(snap) {
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
      await firebase
        .database()
        .ref('users/' + data.userID)
        .off('value');
      await dispatch(resetUserInfo());
      return true;
    }
    return true;
  };
};
