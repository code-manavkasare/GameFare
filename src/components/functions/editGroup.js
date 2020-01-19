import firebase from 'react-native-firebase';
import {unsubscribeUserFromTopics} from '../functions/notifications';
import {uploadPictureFirebase} from '../functions/pictures';



// Should not be used to remove players. removeUserFromGroup(...) ensures the removed user will be notified of the event.
async function editGroup(updatedGroup, callback = () => {}) {
    // handle uploading of new image if one selected
    let pictureURI = updatedGroup.img;
    if (pictureURI !== undefined) {
        delete updatedGroup.img;
        if (pictureURI !== '') {
            pictureURI = await uploadPictureFirebase(
                pictureURI,
                'groups/' + updatedGroup.objectID,
            );
            updatedGroup = {
                ...updatedGroup,
                pictures: [pictureURI],
            };
        }
    }
    // upload to firebase
    await firebase
    .database()
    .ref('groups/' + updatedGroup.objectID + '/')
    .update(updatedGroup)
    .then(() => callback)
    .catch(err => {throw err;});
}

async function removeUserFromGroup(playerID, group) {
    // unsubscribe user from notifications
    // try {
    //     await unsubscribeUserFromTopics(player.id, [group.objectID]);
    // } catch (error) {
    //     console.log(error);
    // }
    // remove user from group data, sends notification to user server-side
    // server handler should unsubscribe from group topic as well
    // would like better way to do this.
    let index = group.allMembers.indexOf(playerID);
    await firebase
    .database()
    .ref('groups/' + group.objectID + '/allMembers/' + index)
    .remove()
    .catch(err => {throw err;});

    await firebase
    .database()
    .ref('groups/' + group.objectID + '/members/' + playerID)
    .remove()
    .catch(err => {throw err;});
}

module.exports = {editGroup, removeUserFromGroup};
