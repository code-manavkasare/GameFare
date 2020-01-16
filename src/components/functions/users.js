import {indexUsers} from '../database/algolia';

async function autocompleteSearchUsers(search) {
  const {hits} = await indexUsers.search({
    query: search,
  });
  const users = hits.filter((user) => user.info.firstname);
  return users;
}

module.exports = {
  autocompleteSearchUsers,
};
