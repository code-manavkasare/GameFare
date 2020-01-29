import firebase from 'react-native-firebase';
import moment from 'moment';

// helpers for EventPage in edit mode
function nextGender(currentGender, inc) {
  const genders = ['mixed', 'female', 'male'];
  let index = genders.indexOf(currentGender);
  const nextIndex =
    (((index + inc) % genders.length) + genders.length) % genders.length; // allows for 'correct' negative mod
  return genders[nextIndex];
}

function nextRule(currentRule, league, inc) {
  const rules = league.rules;
  const rule = Object.values(rules).filter(
    r => r.value === currentRule,
  )[0];
  const i = rules.indexOf(rule);
  const next = (((i + inc) % rules.length) + rules.length) % rules.length;
  console.log('next rule: ' + rules[next].value);
  return rules[next].value;
}



// end helpers


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
      await firebase.messaging.sendToTopic(topicEvent, editNotif);
    } catch (err) {
      console.log(err.message);
    }
    return true;
}

async function removePlayerFromEvent(player, event) {
  if (event.allAttendees) {
    let index = event.allAttendees.indexOf(player.id);
    if (index !== -1) {
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

module.exports = {editEvent, removePlayerFromEvent, nextGender, nextRule};
