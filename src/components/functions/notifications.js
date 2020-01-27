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


module.exports = {subscribeToTopics, updateUserFCMToken};
