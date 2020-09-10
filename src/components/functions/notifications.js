import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import PushNotificationIOS from '@react-native-community/push-notification-ios'; //DO NOT DELETE, USEFUL FOR PushNotification
import PushNotification from 'react-native-push-notification';
import {store} from '../../../reduxStore.js';

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

const conversationIsInNotification = (coachSessionId, notifications) => {
  let isInNotification = false;
  for (const notification of notifications) {
    const {action, coachSessionID} = notification.data;
    if (action === 'Conversation' && coachSessionID === coachSessionId) {
      isInNotification = true;
    }
  }
  return isInNotification;
};

module.exports = {
  conversationIsInNotification,
  refreshTokenOnDatabase,
  subscribeToTopics,
  updateNotificationBadge,
};
