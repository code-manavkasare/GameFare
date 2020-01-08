import firebase from 'react-native-firebase';

async function editEvent(updatedEvent, callback) {
    await firebase
    .database()
    .ref('events/' + updatedEvent.objectID + '/')
    .update(updatedEvent)
    .then(() => callback);
}     

module.exports = {editEvent};
