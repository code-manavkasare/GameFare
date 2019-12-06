import React, { Component } from 'react';
import {
  Platform,
  PermissionsAndroid,
} from 'react-native';

import {uploadPictureFirebase} from '../functions/pictures'
import {subscribeToTopics} from '../functions/notifications'
import {indexEvents} from '../database/algolia'
import firebase from 'react-native-firebase'
import axios from 'axios'
import stripe from 'tipsi-stripe'

stripe.setOptions({
  publishableKey: 'pk_live_wO7jPfXmsYwXwe6BQ2q5rm6B00wx0PM4ki',
  merchantId: 'merchant.gamefare',
  androidPayMode: 'test',
  requiredBillingAddressFields:['all']
});
var options ={
  requiredBillingAddressFields:['postal_address']
}

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
    info:infoUser,
    id:userID,
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

async function checkUserAttendingEvent(userID,data){
  var filterAttendees = 'allAttendees:' + userID + ' OR allCoaches:' + userID + ' OR info.organizer:' + userID
  indexEvents.clearCache()
  var {hits} = await indexEvents.search({
    query:data.objectID,
    filters:filterAttendees,
  })
  if (hits.length != 0 && userID == data.info.organizer) return {response:false,message:'You are the organizer of this event. You cannot attend your own event.'}
  else if (hits.length != 0) return {response:false,message:'You are already attending this event. You cannot join it again.'}
  return {response:true}
}

async function payEntryFee(now,data,userID,cardInfo,coach,infoUser) {  
  var cardID = ''
  if (coach) return {response:true}

  var amountToPay = Math.max(0,Number(data.price.joiningFee)-Number(cardInfo.totalWallet))
  if (amountToPay != 0) {
    cardID = cardInfo.defaultCard.id
  }
  if (amountToPay != 0 && cardID == 'applePay') {
    try {
      this.setState({loader:false})
      const items = [{
        label: 'GameFare',
        amount: amountToPay.toFixed(2),
      }]
      const token = await stripe.paymentRequestWithApplePay(items,options)
      var tokenCard = token.tokenId
      
      var url = 'https://us-central1-getplayd.cloudfunctions.net/addUserCreditCard'
      const promiseAxios = await axios.get(url, {
        params: {
          tokenCard: tokenCard,
          userID: userID,
          tokenStripeCus: cardInfo.tokenCusStripe,
          name:infoUser.firstname  + ' ' + infoUser.lastname,
          email:infoUser.email == undefined?'':infoUser.email,
          brand: cardInfo.defaultCard.brand
        }
      })
      if (promiseAxios.data.response == false) {
        stripe.cancelApplePayRequest()
      } else {
        cardID =  promiseAxios.data.cardID
        await stripe.completeApplePayRequest()
      }
    } catch (err) {
      stripe.cancelApplePayRequest()
      return  {response:false,message:'cancel'}
    }
  }
  if (Number(data.price.joiningFee) != 0) {
    try {
      var url = 'https://us-central1-getplayd.cloudfunctions.net/payEntryFee'
      const promiseAxios = await axios.get(url, {
        params: {
          cardID: cardID,
          now:now,
          userID: this.props.userID,
          tokenCusStripe: this.props.tokenCusStripe,
          currentUserWallet:Number(this.props.totalWallet),
          amount:data.price.joiningFee,
          eventID:data.eventID
        }
      })

      if (promiseAxios.data.response == false) return {response:false,message:promiseAxios.data.message}
      return {response:true}
    }catch (err) {
      return {response:false,message:err.toString()}
    }
  }
  return {response:true}
}

function statusNewUser (data,level,coach) {
  if (coach) return 'pending'
  if (!data.info.public) return 'confirmed'
  if (data.info.levelFilter == undefined) return 'confirmed'
  if (level == undefined) return 'pending'
  if (level[data.info.sport] == undefined) return 'pending'
  var levelOption = data.info.levelOption
  var levelFilter = data.info.levelFilter
  var userLevel = level[data.info.sport]
  if (levelOption == 'equal' && userLevel == levelFilter) return 'confirmed'
  else if (levelOption == 'min' && userLevel >= levelFilter) return 'confirmed'
  else if (levelOption == 'max' && userLevel <= levelFilter) return 'confirmed'
  return 'pending'
}

async function joinEvent (data,userID,infoUser,level,cardInfo,coach,users) {
  var {response,message} = await checkUserAttendingEvent(userID,data) 
  if (!response) return {response,message}

  var now = (new Date()).toString()
  var {message,response} = await payEntryFee(now,data,userID,cardInfo,coach,infoUser)

  // if (!data.info.public && coach) {
  //   var newLevel = data.info.levelFilter
  //   if (data.info.levelOption == 'max' || newLevel == 0) {
  //     newLevel = 1
  //   }
  //   await firebase.database().ref('users/' + userID + '/level/').update({
  //     [data.info.sport]:newLevel
  //   })
  // }

  var pushSection = 'attendees'
  if (coach) pushSection = 'coaches'

  var usersToPush = {}
  console.log('lalalalaaaa')
  console.log(users)
  for (var i in users) {
    var user = {
      ...users[i],
      coach:coach,
      status:'confirmed',
      date:now,
    }
    usersToPush = {
      ...usersToPush,
      [user.id]:user
    }
    console.log('push user !!!!!')
    console.log(pushSection)
    console.log(users[i].id)
    await firebase.database().ref('events/' + data.objectID + '/' + pushSection + '/' + users[i].id).update(user)
  }

  await subscribeToTopics([userID,'all',data.objectID])
  return {response:true,message:{usersToPush:usersToPush,pushSection:pushSection}}
}


module.exports = {createEvent,joinEvent};