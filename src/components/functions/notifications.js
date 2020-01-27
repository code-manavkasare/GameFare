import React, { Component } from 'react';
import {
  Platform,
  PermissionsAndroid,
} from 'react-native';

import firebase from 'react-native-firebase';
import axios from 'axios';


async function permissions () {
  try {
    await firebase.messaging().requestPermission();
    return true;
  } catch (err) {
    return false;
  }
}

async function sendNotificationToTopic(notification, topic) {
  await firebase.messaging.sendToTopic(topic, notification);
}

async function subscribeToTopics(topics) {
  var permission = await permissions();
  if (!permission) return false;
  for (var i in topics) {
    await firebase.messaging().subscribeToTopic(topics[i]);
  }
  return true;
}

async function updateUserFCMToken(userID, token) {
  console.log(userID);
  await firebase
  .database()
  .ref('users/' + userID + '/')
  .update({FCMToken: token});
  return true;
}

async function unsubscribeUserFromTopics(userID, topics) {
    try {
      var url = 'https://us-central1-getplayd.cloudfunctions.net/unsubscribeUserFromTopics';
      const promiseAxios = await axios.get(url, {
        params: {
          userID: userID,
          topics: topics,
        },
      });
      if (!promiseAxios.data.response) {
        console.log(promiseAxios.data.message);
      }
    } catch (err) {
      console.log(err.message);
      return false;
    }
    return true;
}

module.exports = {subscribeToTopics, unsubscribeUserFromTopics, updateUserFCMToken, sendNotificationToTopic};
