import algoliasearch from 'algoliasearch/reactnative';

var client = algoliasearch('EX9TV715SD', '36bc4371bcdde61e2e4d5f05c8a274ce');
var indexEvents = client.initIndex('eventsGF');
var indexPastEvents = client.initIndex('pastEventsGF');
var indexGroups = client.initIndex('groupsGF');
var indexDiscussions = client.initIndex('discussionsGF');

module.exports = {indexEvents, indexGroups, indexPastEvents, indexDiscussions};
// export default indexGroups
