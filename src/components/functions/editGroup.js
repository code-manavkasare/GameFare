import firebase from 'react-native-firebase';
import {unsubscribeUserFromTopics} from '../functions/notifications';
import {uploadPictureFirebase} from '../functions/pictures';



// Should not be used to remove players. removeUserFromGroup(...) ensures the removed user will be notified of the event.
async function editGroup(updatedGroup, callback = () => {}) {
    // handle uploading of new image if one selected
    if (updatedGroup.img) {
        let uri = await uploadPictureFirebase(
            uri,
            'groups/' + updatedGroup.objectID,
        );
        delete updatedGroup.img;
        updatedGroup = {
            ...updatedGroup,
            pictures: [uri],
        };
    }
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
    if (group.allMembers) {
        let index = group.allMembers.indexOf(playerID);
        if (index) {
            await firebase
            .database()
            .ref('groups/' + group.objectID + '/allMembers/' + index)
            .remove()
            .catch(err => {throw err;});
        }
    }
    await firebase
    .database()
    .ref('groups/' + group.objectID + '/members/' + playerID)
    .remove()
    .catch(err => {throw err;});
}

module.exports = {editGroup, removeUserFromGroup};
