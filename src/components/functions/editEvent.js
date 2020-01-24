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
  // unsubscribe user from notifications
  try {
    await unsubscribeUserFromTopics(player.id, [event.objectID]);
  } catch (error) {
    console.log(error);
  }
  if (event.allAttendees) {
    let index = event.allAttendees.indexOf(player.id);
    if (index) {
        await firebase
        .database()
        .ref('events/' + event.objectID + '/allAttendees/' + index)
        .remove()
        .catch(err => {throw err;});
    }
  }
  await firebase
  .database()
  .ref('events/' + event.objectID + '/attendees/' + player.id)
  .remove()
  .catch(err => {throw err;});
}

module.exports = {editEvent, removePlayerFromEvent};
