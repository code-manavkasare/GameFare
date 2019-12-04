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


async function createEventObj(data,userID,infoUser,level,groups) {
  var event = {
    ...data,
    info:{
      ...data.info,
      organizer:userID,
    }
  }
  var attendees = {}
  var coaches = {}
  var user = {
    captainInfo:{
      name:infoUser.firstname  + ' ' + infoUser.lastname,
      level:level == undefined?'':level[data.info.sport] == undefined?'':level[data.info.sport],
      picture:infoUser.picture == undefined?'':infoUser.picture,
      userID:userID,
      phoneNumber:infoUser.countryCode + infoUser.phoneNumber,
    },
    status:'confirmed',
    userID:userID,
  }
  if (!event.info.coach) {
    user.coach = false
    attendees = {
      [userID]:user
    }
  } else {
    user.coach = true
    coaches = {
      [userID]:user
    }
  }
  var allAttendees = Object.values(attendees).map((user) => {
    return user.userID
  })
  var allCoaches = Object.values(coaches).map((user) => {
    return user.userID
  })
  return {
    ...event,
    date_timestamp:Number(new Date(event.date.start)),
    coaches:coaches,
    allCoaches:allCoaches,
    attendees:attendees,
    allAttendees:allAttendees,
  }
}

async function pushEventToGroups(groups,eventID) {
  for (var i in groups) {
    await firebase.database().ref('groups/' + groups[i] + '/events').update({[eventID]:{
      eventID:eventID
    }})
  }
}

async function createEvent(data,userID,infoUser,level) {
  var pictureUri = await uploadPictureFirebase(data.images[0],'events/' + generateID())
  if (!pictureUri) return false

  var event = await createEventObj(data,userID,infoUser,level)
  console.log('event obj received')
  console.log(event)
  
  event.images = [pictureUri]
  var pushEvent = await firebase.database().ref('events').push(event)
  event.eventID = pushEvent.key
  event.objectID = pushEvent.key
  
  await firebase.database().ref('events/' + pushEvent.key).update({'eventID':pushEvent.key})

  await pushEventToGroups(data.groups,pushEvent.key)
  await subscribeToTopics([userID,'all',pushEvent.key])

  return event
}


module.exports = {createEvent};