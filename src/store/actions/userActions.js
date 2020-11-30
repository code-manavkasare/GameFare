import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import Mixpanel from 'react-native-mixpanel';
import equal from 'fast-deep-equal';
import RnBgTask from 'react-native-bg-thread';

import {
  RESET_USER_INFO,
  RESET_USER_MESSAGES,
  SET_USER_INFO,
  SET_USER_CLOUD_ARCHIVES,
  RESET_USER_CLOUD_ARCHIVES,
  SET_USER_SESSIONS,
  RESET_USER_SESSIONS,
  SET_USER_SESSIONS_REQUESTS,
  RESET_USER_SESSIONS_REQUESTS,
  SET_USER_NOTIFICATIONS,
  RESET_USER_NOTIFICATIONS,
  SET_USER_BLOCKED_USERS,
  RESET_USER_BLOCKED_USERS,
  SET_USER_BLOCKED_BY_USERS,
  RESET_USER_BLOCKED_BY_USERS,
  SET_USER_SILENT_FRIENDS,
  RESET_USER_SILENT_FRIENDS,
} from '../types';
import {store} from '../reduxStore';

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

const setUserCloudArchives = (archives) => ({
  type: SET_USER_CLOUD_ARCHIVES,
  archives,
});
const resetUserCloudArchives = () => ({
  type: RESET_USER_CLOUD_ARCHIVES,
});

const setUserSessions = (sessions) => ({
  type: SET_USER_SESSIONS,
  sessions,
});
const resetUserSessions = () => ({
  type: RESET_USER_SESSIONS,
});

const setUserSessionsRequests = (sessions) => ({
  type: SET_USER_SESSIONS_REQUESTS,
  sessions,
});
const resetUserSessionsRequests = () => ({
  type: RESET_USER_SESSIONS_REQUESTS,
});

const setUserNotifications = (notifications) => ({
  type: SET_USER_NOTIFICATIONS,
  notifications,
});
const resetUserNotifications = () => ({
  type: RESET_USER_NOTIFICATIONS,
});

const setUserBlockedUsers = (users) => ({
  type: SET_USER_BLOCKED_USERS,
  users,
});
const resetUserBlockedUsers = () => ({
  type: RESET_USER_BLOCKED_USERS,
});

const setUserBlockedByUsers = (users) => ({
  type: SET_USER_BLOCKED_BY_USERS,
  users,
});
const resetUserBlockedByUsers = () => ({
  type: RESET_USER_BLOCKED_BY_USERS,
});

const setUserSilentFriends = (users) => ({
  type: SET_USER_SILENT_FRIENDS,
  users,
});
const resetUserSilentFriends = () => ({
  type: RESET_USER_SILENT_FRIENDS,
});

export const signIn = async ({
  firebaseSignInToken,
  countryCode,
  phoneNumber,
}) => {
  const user = await auth().signInWithCustomToken(firebaseSignInToken);
  const userID = user.user.uid;
  await subscribeToTopics([userID]);

  Mixpanel.identify(userID);
  Mixpanel.set({userID});
  RnBgTask.runInBackground(() => {
    database()
      .ref('users/' + userID)
      .on('value', async function(snap) {
        const {
          notifications,
          archivedStreams,
          coachSessions,
          coachSessionsRequests,
          wallet,
          userInfo,
          silentFriends,
          settings,
          profileCompleted,
          blockedUsers,
          blockedByUsers,
          permissionOtherUserToRecord,
          appSettings,
        } = snap.val();
        const prevNotifications = store.getState().userNotifications;
        if (!equal(prevNotifications, notifications))
          store.dispatch(setUserNotifications(notifications));

        const prevCloudArchives = store.getState().userCloudArchives;
        if (!equal(prevCloudArchives, archivedStreams))
          store.dispatch(setUserCloudArchives(archivedStreams));

        const prevUserSession = store.getState().userSessions;
        if (!equal(prevUserSession, coachSessions))
          store.dispatch(setUserSessions(coachSessions));

        const prevSessionsRequests = store.getState().userSessionsRequests;
        if (!equal(prevSessionsRequests, coachSessionsRequests))
          store.dispatch(setUserSessionsRequests(coachSessionsRequests));

        const prevBlockedUsers = store.getState().userBlockedUsers;
        if (!equal(prevBlockedUsers, blockedUsers))
          store.dispatch(setUserBlockedUsers(blockedUsers));

        const prevBlockedByUsers = store.getState().userBlockedByUsers;
        if (!equal(prevBlockedByUsers, blockedByUsers))
          store.dispatch(setUserBlockedByUsers(blockedByUsers));

        const prevSilentFriends = store.getState().userSilentFriends;
        if (!equal(prevSilentFriends, silentFriends))
          store.dispatch(setUserSilentFriends(silentFriends));

        const currentInfoUser = store.getState().user;
        if (!equal(currentInfoUser, coachSessionsRequests))
          await store.dispatch(
            setUserInfo({
              userID,
              infoUser: {
                userInfo,
                wallet,
                silentFriends,
                appSettings,
                permissionOtherUserToRecord,
              },
              settings,
              userConnected: profileCompleted ? true : false,
              phoneNumber,
              countryCode,
            }),
          );
      });
  });
};

const logout = async () => {
  const {userID} = store.getState().user;
  await messaging().unsubscribeFromTopic(userID);
  await database()
    .ref(`users/${userID}`)
    .off('value');
  await store.dispatch(resetUserInfo());
  await store.dispatch(resetDataCoachSession());
  await store.dispatch(resetCloudArchives());
  await store.dispatch(resetSessions());
  await store.dispatch(resetMessages());
  await store.dispatch(resetUserCloudArchives());
  await store.dispatch(resetUserSessions());
  await store.dispatch(resetUserSessionsRequests());
  await store.dispatch(resetUserNotifications());
  await store.dispatch(resetUserBlockedUsers());
  await store.dispatch(resetUserBlockedByUsers());
  await store.dispatch(resetUserSilentFriends());

  return true;
};

export {
  setUserCloudArchives,
  resetUserCloudArchives,
  setUserSessions,
  resetUserSessions,
  setUserSessionsRequests,
  resetUserSessionsRequests,
  setUserNotifications,
  resetUserNotifications,
  logout,
};
