import algoliasearch from 'algoliasearch';
import Config from 'react-native-config';

const client = algoliasearch('F4SW2K5A54', '567ba66321018b3bdc5e90fc9e0e26d3', {
  timeouts: {
    connect: 1,
    read: 2,
    write: 30,
  },
});

let indexUsers = client.initIndex('prod_users');
let indexDiscussions = client.initIndex('prod_discussions');
let indexClubs = client.initIndex('prod_clubs');

if (Config.ENV === 'dev') {
  indexUsers = client.initIndex('dev_users');
  indexDiscussions = client.initIndex('dev_discussions');
  indexClubs = client.initIndex('dev_clubs');
}

const getBlockedUsers = async (objectIDArray) => {
  await client.clearCache();
  const {results} = await indexUsers.getObjects(objectIDArray);
  return results;
};

module.exports = {
  indexUsers,
  indexDiscussions,
  indexClubs,
  getBlockedUsers,
  client,
};
