import React, { Component } from 'react';
import {
  Platform,
  PermissionsAndroid,
} from 'react-native';

import {uploadPictureFirebase} from '../functions/pictures'
import {subscribeToTopics} from '../functions/notifications'
import firebase from 'react-native-firebase'

function generateID () {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function createGroup(data,userID,infoUser) {
    var pictureUri = await uploadPictureFirebase(data.img,'groups/' + generateID())
    if (!pictureUri) return false
    var group = {
      ...data,
      info:{
        ...data.info,
        organizer:userID,
      },
      pictures:[pictureUri],
      organizer:{
        userID:userID,
        name:infoUser.firstname + ' ' + infoUser.lastname
      },
    }
    delete group['img']

    console.log('event')
    console.log(group)
    //var pushEvent = await firebase.database().ref('groups').push(group)
    var pushEvent = {key:'skfjhdfgkdjhgjf'}
    group.objectID = pushEvent.key

    await subscribeToTopics([userID,'all',pushEvent.key])
    return group  
}


module.exports = {createGroup};