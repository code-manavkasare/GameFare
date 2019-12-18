import algoliasearch from 'algoliasearch/reactnative';

const client = algoliasearch('EX9TV715SD', '36bc4371bcdde61e2e4d5f05c8a274ce');
const indexEvents = client.initIndex('eventsGF');
const indexPastEvents = client.initIndex('pastEventsGF');
const indexGroups = client.initIndex('groupsGF');
const indexDiscussions = client.initIndex('discussionsGF');

async function getMyGroups(userID, filterSport) {
  indexGroups.clearCache();
  var filterOrganizer = 'info.organizer:' + userID + ' OR allMembers:' + userID;
  var filters = filterOrganizer + filterSport;
  var {hits} = await indexGroups.search({
    query: '',
    filters: filters,
  });
  return hits;
}

module.exports = {
  indexEvents,
  indexGroups,
  indexPastEvents,
  indexDiscussions,
  getMyGroups,
};
// export default indexGroups
