import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import PushNotificationIOS from '@react-native-community/push-notification-ios'; //DO NOT DELETE, USEFUL FOR PushNotification
import PushNotification from 'react-native-push-notification';
import equal from 'fast-deep-equal';

import {getValueOnce} from '../database/firebase/methods.js';

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
    .ref('users/' + userID + '/')
    .update({FCMToken: token});
  return true;
};

const updateNotificationBadge = (notificationNumber) => {
  PushNotification.setApplicationIconBadgeNumber(notificationNumber);
};

const updateNotificationBadgeInBackground = async (userId) => {
  const notifications = await getValueOnce(`users/${userId}/notifications`);
  if (notifications) {
    updateNotificationBadge(Object.values(notifications).length);
  }
};

const deleteNotifications = async (userId, coachSessionId, notifications) => {
  let updates = {};
  for (const notification of notifications) {
    const {action, coachSessionID, notificationId} = notification.data;
    if (action === 'Conversation' && coachSessionID === coachSessionId) {
      updates[`users/${userId}/notifications/${notificationId}`] = null;
    }
  }
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
  deleteNotifications,
  refreshTokenOnDatabase,
  subscribeToTopics,
  updateNotificationBadge,
  updateNotificationBadgeInBackground,
};
