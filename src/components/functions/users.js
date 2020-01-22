import {indexUsers} from '../database/algolia';

async function autocompleteSearchUsers(search, userID) {
  const {hits} = await indexUsers.search({
    query: search,
    filters: 'NOT objectID:' + userID,
  });
  const users = hits.filter((user) => user.info.firstname);
  return users;
}

module.exports = {
  autocompleteSearchUsers,
};
