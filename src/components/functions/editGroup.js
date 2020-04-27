import database from '@react-native-firebase/database';

async function editGroup(updatedGroup, callback = () => {}) {
  // handle uploading of new image if one selected
  await database()
    .ref('groups/' + updatedGroup.objectID + '/')
    .update(updatedGroup)
    .then(() => callback)
    .catch((err) => {
      throw err;
    });
  return true;
}

async function removeUserFromGroup(playerID, group) {
  await database()
    .ref('groups/' + group.objectID + '/members/' + playerID)
    .remove()
    .catch((err) => {
      throw err;
    });
  return true;
}

module.exports = {editGroup, removeUserFromGroup};
