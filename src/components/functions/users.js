import {indexUsers, client} from '../database/algolia';
import database from '@react-native-firebase/database';
import {store} from '../../store/reduxStore';

const autocompleteSearchUsers = async (
  search,
  userID,
  searchCurrentUser,
  blockedByUsers,
  searchCoaches,
) => {
  await client.clearCache();
  let filters = `NOT objectID:${userID}`;
  if ((!userID || userID === '' || searchCurrentUser) && !blockedByUsers) {
    filters = '';
  }
  if ((!userID || userID === '' || searchCurrentUser) && blockedByUsers) {
    filters = `NOT objectID:${blockedByUsers[0]}`;
    blockedByUsers.map((blockedByUser, i) => {
      if (i > 0) filters = filters + ` AND NOT objectID:${blockedByUser}`;
    });
  } else if (userID && blockedByUsers) {
    blockedByUsers.map((blockedByUser) => {
      filters = filters + ` AND NOT objectID:${blockedByUser}`;
    });
  }
  if (searchCoaches && filters === '') filters = `info.coach = 1`;
  else if (searchCoaches) filters = filters + ` AND info.coach = 1`;
  const {hits} = await indexUsers.search(search, {
    hitsPerPage: 500,
    filters: filters,
  });
  const users = hits.filter((user) => user.info.firstname);
  return users;
};

function userObject(userID) {
  const infoUser = store.getState().infoUser;
  return {
    id: userID,
    info: infoUser,
  };
}

function messageAvatar(infoUser) {
  if (!infoUser)
    return 'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/icons%2Favatar.png?alt=media&token=290242a0-659a-4585-86c7-c775aac04271';
  if (!infoUser.picture)
    return 'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/icons%2Favatar.png?alt=media&token=290242a0-659a-4585-86c7-c775aac04271';
  return infoUser.picture;
}

function messageName(infoUser) {
  if (!infoUser) return 'User old data';
  return infoUser.firstname + ' ' + infoUser.lastname;
}

const formatPhoneNumber = (phoneNumber) => {
  let phone = phoneNumber.replace(/[^\w\s]/gi, '');
  phone = phone.replace(/ /g, '');

  return phone;
};

const toggleUserPublic = () => {
  const {userID} = store.getState().user;
  const {isPrivate} = store.getState().user.infoUser.userInfo;

  database()
    .ref()
    .update({[`users/${userID}/userInfo/isPrivate/`]: !isPrivate});
};

const isUserPrivate = (user) => {
  const {id, info} = user;
  if (id && info) {
    const {isPrivate} = user.info;
    const silentFriends = store.getState().userSilentFriends;
    return isPrivate && !silentFriends[id];
  }
  return false;
};

module.exports = {
  autocompleteSearchUsers,
  userObject,
  messageAvatar,
  messageName,
  formatPhoneNumber,
  toggleUserPublic,
  isUserPrivate,
};
