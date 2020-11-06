import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import Mixpanel from 'react-native-mixpanel';
import equal from 'fast-deep-equal';

import {
  HIDE_FOOTER_APP,
  RESET_USER_INFO,
  RESET_USER_MESSAGES,
  SET_LAYOUT_SETTINGS,
  SET_USER_INFO,
} from '../types';
import {store} from '../reduxStore'

import {resetDataCoachSession} from './coachActions';
import {resetCloudArchives} from './archivesActions.js';
import {resetSessions} from './coachSessionsActions.js';

import {subscribeToTopics} from '../../components/functions/notifications';
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
          const infoUser = snap.val();
          let userConnected = false;
          if (infoUser.profileCompleted) userConnected = true;

          const infoUserToPush = {
            userID: userID,
            infoUser,
            userConnected,
            phoneNumber: data.phoneNumber,
            countryCode: data.countryCode,
          };

          const currentInfoUser = store.getState().user.infoUser.userInfo;
          if (!equal(currentInfoUser, infoUser))
            await dispatch(setUserInfo(infoUserToPush));

          return userConnected;
        });
    } else if (val === 'logout') {
      await messaging().unsubscribeFromTopic(data.userID);
      await database()
        .ref('users/' + data.userID)
        .off('value');
      await dispatch(resetUserInfo());
      await dispatch(resetDataCoachSession());
      await dispatch(resetCloudArchives());
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

export {userAction};