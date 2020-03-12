import firebase from 'react-native-firebase';

export const blockUnblockUser = async (block, userID, userIDToBlockUnblock) => {
  await firebase
    .database()
    .ref(`users/${userID}/blockedUsers`)
    .update({[userIDToBlockUnblock]: block ? true : null});
};
