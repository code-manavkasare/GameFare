import firebase from 'react-native-firebase';
import moment from 'moment';


import {unsubscribeUserFromTopics} from '../functions/notifications';

async function editEvent(updatedEvent, callback = () => {}) {
  updatedEvent = {
    ...updatedEvent,
    _geoloc: {
      lat: updatedEvent.location.lat,
      lng: updatedEvent.location.lng,
    },
    date_timestamp: moment(updatedEvent.date.start).valueOf(),
    end_timestamp: moment(updatedEvent.date.end).valueOf(),
  };
  await firebase
    .database()
    .ref('events/' + updatedEvent.objectID + '/')
    .update(updatedEvent)
    .then(() => callback)
    .catch((err) => {
      throw err;
    });
  // TODO send notification to subscribed players
}

async function removePlayerFromEvent(player, event) {
  // refund entree fee paid
  const amountPaid = event.attendees[player.id].amountPaid;
  if (amountPaid !== (undefined && 0)) {
    await refundPlayer(player, amountPaid).catch((err) => {
      console.log(err.message);
    });
  }
  // unsubscribe user from notifications
  try {
    await unsubscribeUserFromTopics(player.id, [event.objectID]);
  } catch (error) {
    console.log(error);
  }
  // remove player from database event
  for (var i in event.allAttendees) {
    if (event.allAttendees[i] === player.id) {
      delete event.allAttendees[i];
      break;
    }
  }
  delete event.attendees[player.id];
  try {
    await editEvent(event);
  } catch (error) {
    console.log('Error removing player from database: ' + error);
  }
}

async function refundPlayer(player, amount, callback = () => {}) {
  let walletAfterRefund;
  await firebase
    .database()
    .ref('users/' + player.id + '/wallet/totalWallet')
    .once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        throw 'Could not access value of ' + player.id + '/wallet/totalWallet';
      }
      walletAfterRefund = snapshot.val() + amount;
    })
    .catch((err) => {
      throw err;
    });

  await firebase
    .database()
    .ref('users/' + player.id + '/wallet/')
    .update({totalWallet: walletAfterRefund})
    .catch((err) => {
      throw err;
    });
}

module.exports = {editEvent, removePlayerFromEvent};
