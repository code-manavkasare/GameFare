import firebase from 'react-native-firebase';
import {unsubscribeUserFromTopics} from '../functions/notifications';
import {uploadPictureFirebase} from '../functions/pictures';



async function editGroup(updatedGroup, callback = () => {}) {
    // handle uploading of new image if one selected
    let pictureURI = updatedGroup.img;
    if (updatedGroup.img !== undefined) delete updatedGroup.img;
    if (pictureURI !== '') {
        pictureURI = await uploadPictureFirebase(
            pictureURI,
            'groups/' + updatedGroup.objectID,
        );
        updatedGroup = {
            ...updatedGroup,
            pictures: [pictureURI],
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

async function removeUserFromGroup(player, group) {
    // unsubscribe user from notifications
    // try {
    //     await unsubscribeUserFromTopics(player.id, [group.objectID]);
    // } catch (error) {
    //     console.log(error);
    // }
    // remove user from group data, sends notification to user server-side
    // server handler should unsubscribe from group topic as well
    await firebase
    .database()
    .ref('groups/' + group.objectID + '/members/' + player.id)
    .remove()
    .catch(err => {throw err;});
}

module.exports = {editGroup, removeUserFromGroup};
