import firebase from 'react-native-firebase';
import moment from 'moment';


import {unsubscribeUserFromTopics, sendNotificationToTopic} from '../functions/notifications';

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
    try {
      var editNotif = {
        notification: {
          title: 'The event organizer has edited the event details of ' + updatedEvent.info.name,
          body: '',
          sound: 'default',
        },
        data: {
          action: 'openEventPage',
          objectID: updatedEvent.objectID,
        },
      };
      var topicEvent = '/topics/' + updatedEvent.objectID;
      await sendNotificationToTopic(topicEvent, editNotif);
    } catch (err) {
      console.log(err.message);
    }
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
