import firebase from 'react-native-firebase';

async function editEvent(updatedEvent, callback = () => {}) {
    // check to make sure edited event has valid structure?
    await firebase
    .database()
    .ref('events/' + updatedEvent.objectID + '/')
    .update(updatedEvent)
    .then(() => callback)
    .catch((error) => {throw error;});
}

async function refundPlayer(player, amount, callback = () => {}) {
    console.log('refunding player');
    console.log(player);
    console.log('amount');
    console.log(amount);
    return {response: true};
    // await (db.ref('users/' + query.userID + '/wallet/').update({'totalWallet':0}))  
}

module.exports = {editEvent, refundPlayer};
