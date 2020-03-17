import firebase from 'react-native-firebase';
import moment from 'moment';

async function editChallenge(updatedEvent, callback = () => {}) {
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
    .ref('challenges/' + updatedEvent.objectID + '/')
    .update(updatedEvent)
    .then(() => callback)
    .catch((err) => {
      throw err;
    });
  return true;
}

async function removePlayerFromChallenge(team, challenge) {
  await firebase
    .database()
    .ref('challenges/' + challenge.objectID + '/teams/' + team.id)
    .remove()
    .catch((err) => {
      throw err;
    });
}

module.exports = {
  editChallenge,
  removePlayerFromChallenge,
};
