import database from '@react-native-firebase/database';

export const blockUnblockUser = async (block, userID, userIDToBlockUnblock) => {
  await database()
    .ref(`users/${userID}/blockedUsers`)
    .update({[userIDToBlockUnblock]: block ? true : null});
};
