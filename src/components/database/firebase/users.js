import database from '@react-native-firebase/database';

export const blockUnblockUser = async (block, userID, userIDToBlockUnblock) => {
  let updates = {};
  updates[`users/${userID}/blockedUsers/${userIDToBlockUnblock}`] = block
    ? true
    : null;
  updates[`users/${userIDToBlockUnblock}/blockedByUsers/${userID}`] = block
    ? true
    : null;

  await database()
    .ref()
    .update(updates);
};
