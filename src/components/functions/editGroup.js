import firebase from 'react-native-firebase';
import {uploadPictureFirebase} from '../functions/pictures';

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
    .catch((err) => {
      throw err;
    });
  try {
    var editNotif = {
      notification: {
        title:
          'The group admin has edited the details of ' + updatedGroup.info.name,
        body: '',
        sound: 'default',
      },
      data: {
        action: 'openGroupPage',
        objectID: updatedGroup.objectID,
      },
    };
    var topicGroup = '/topics/' + updatedGroup.objectID;
    await firebase.messaging.sendToTopic(topicGroup, editNotif);
  } catch (err) {
    console.log(err.message);
  }
  return true;
}

async function removeUserFromGroup(playerID, group) {
  await firebase
    .database()
    .ref('groups/' + group.objectID + '/members/' + playerID)
    .remove()
    .catch((err) => {
      throw err;
    });
  return true;
}

module.exports = {editGroup, removeUserFromGroup};