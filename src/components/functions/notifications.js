import React, { Component } from 'react';
import {
  Platform,
  PermissionsAndroid,
} from 'react-native';

import firebase from 'react-native-firebase'

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

async function unsubscribeUserFromTopics(user, topics) {
  console.log(user);
  console.log(topics);
}

module.exports = {subscribeToTopics, unsubscribeUserFromTopics};
