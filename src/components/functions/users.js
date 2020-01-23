import {indexUsers} from '../database/algolia';

async function autocompleteSearchUsers(search, userID) {
  const {hits} = await indexUsers.search({
    query: search,
    filters: 'NOT objectID:' + userID,
  });
  const users = hits.filter((user) => user.info.firstname);
  return users;
}

function userObject(infoUser, userID) {
  return {
    _id: userID,
    name: infoUser.firstname + ' ' + infoUser.lastname,
    avatar: !infoUser.picture
      ? 'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/icons%2Favatar.png?alt=media&token=290242a0-659a-4585-86c7-c775aac04271'
      : infoUser.picture,
  };
}

module.exports = {
  autocompleteSearchUsers,
  userObject,
};
