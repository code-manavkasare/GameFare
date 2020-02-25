import {indexUsers} from '../database/algolia';

async function autocompleteSearchUsers(search, userID) {
  await indexUsers.clearCache();
  let filters = 'NOT objectID:' + userID
  if (!userID || userID == '') filters = ''
  const {hits} = await indexUsers.search({
    query: search,
    hitsPerPage: 500,
    filters: filters,
  });
  const users = hits.filter((user) => user.info.firstname);
  return users;
}

function userObject(infoUser, userID) {
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

module.exports = {
  autocompleteSearchUsers,
  userObject,
  messageAvatar,
  messageName,
};
