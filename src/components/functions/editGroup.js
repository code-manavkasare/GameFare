import firebase from 'react-native-firebase';

async function editGroup(updatedGroup, callback = () => {}) {
  // handle uploading of new image if one selected
  await firebase
    .database()
    .ref('groups/' + updatedGroup.objectID + '/')
    .update(updatedGroup)
    .then(() => callback)
    .catch((err) => {
      throw err;
    });
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
