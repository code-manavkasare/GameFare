import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import PushNotificationIOS from '@react-native-community/push-notification-ios'; //DO NOT DELETE, USEFUL FOR PushNotification
import PushNotification from 'react-native-push-notification';

import {store} from '../../store/reduxStore';

async function permissions() {
  try {
    await messaging().requestPermission();
    return true;
  } catch (err) {
    return false;
  }
}

async function subscribeToTopics(topics) {
  var permission = await permissions();
  if (!permission) {
    return false;
  }
  for (var i in topics) {
    await messaging().subscribeToTopic(topics[i]);
  }
  return true;
}

const refreshTokenOnDatabase = async (userID) => {
  const token = await messaging().getToken();
  await database()
    .ref('users/' + userID + '/settings')
    .update({FCMToken: token});
  return true;
};

const updateNotificationBadge = (notificationNumber) => {
  PushNotification.setApplicationIconBadgeNumber(notificationNumber);
};

const updateNotificationBadgeInBackground = async () => {
  const notifications = await store.getState().userNotifications;
  Object.values(notifications).map((n) => console.log(n?.data));
  if (notifications) {
    updateNotificationBadge(Object.values(notifications).length);
  }
};

const deleteNotificationsByCoachSession = async ({
  userID,
  coachSessionID,
  action = 'Conversation',
}) => {
  if (!userID) userID = store.getState().user.userID;

  let notifications = Object.values(
    (await store.getState().userNotifications) ?? {},
  );

  let updates = {};
  let badgeCount = notifications.length;

  notifications = notifications
    .map((n) => n?.data)
    .filter((n) => n.coachSessionID === coachSessionID && n.action === action)
    .map((n) => {
      updates[`users/${userID}/notifications/${n.notificationId}`] = null;
      badgeCount--;
    });

  updateNotificationBadge(badgeCount);

  if (Object.values(updates).length !== 0) {
    await database()
      .ref()
      .update(updates);
  }
};

const conversationIsInNotification = (coachSessionId, notifications) => {
  if (!notifications) return false;
  let isInNotification = false;
  Object.values(notifications).map((notification) => {
    const {action, coachSessionID} = notification.data;
    if (action === 'Conversation' && coachSessionID === coachSessionId) {
      isInNotification = true;
    }
  });
  return isInNotification;
};

module.exports = {
  conversationIsInNotification,
  deleteNotificationsByCoachSession,
  refreshTokenOnDatabase,
  subscribeToTopics,
  updateNotificationBadge,
  updateNotificationBadgeInBackground,
};
