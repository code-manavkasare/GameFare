import firebase from 'react-native-firebase';

async function editEvent(updatedEvent, callback = () => {}) {
    // check to make sure edited event has valid structure?
    await firebase
    .database()
    .ref('events/' + updatedEvent.objectID + '/')
    .update(updatedEvent)
    .then(() => callback)
    .catch(err => {throw err;});
}

async function refundPlayer(player, amount, callback = () => {}) {
    let walletAfterRefund;
    await firebase
    .database()
    .ref('users/' + player.id + '/wallet/totalWallet')
    .once('value')
    .then(snapshot => {
        if (!snapshot.exists()) {
            throw Error('Could not access value of ' + player.id + '/wallet/totalWallet');
        }
        walletAfterRefund = snapshot.val() + amount;
    })
    .catch(err => {throw err;});

    // this update triggers no cloud functions
    await firebase
    .database()
    .ref('users/' + player.id + '/wallet/')
    .update({'totalWallet':walletAfterRefund})
    .then()
    .catch(err => {throw err;});
}

module.exports = {editEvent, refundPlayer};
