import firebase from 'react-native-firebase';
import {
  unsubscribeUserFromTopics,
  sendNotificationToTopic,
} from '../functions/notifications';
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
    await sendNotificationToTopic(topicGroup, editNotif);
  } catch (err) {
    console.log(err.message);
  }
  return true;
}

async function removeUserFromGroup(playerID, group) {
  let res = await unsubscribeUserFromTopics(playerID, [group.objectID]);
  if (!res) {
    console.log(
      'Could not unsubscribe user :' +
        playerID +
        ' from group: ' +
        group.objectID,
    );
  }
  if (group.allMembers) {
    let index = group.allMembers.indexOf(playerID);
    if (index !== -1) {
      await firebase
        .database()
        .ref('groups/' + group.objectID + '/allMembers/' + index)
        .remove()
        .catch((err) => {
          throw err;
        });
    }
  }
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
