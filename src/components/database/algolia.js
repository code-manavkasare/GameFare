
import algoliasearch from 'algoliasearch/reactnative'

var client = algoliasearch('EX9TV715SD', '36bc4371bcdde61e2e4d5f05c8a274ce');
var indexEvents = client.initIndex('eventsGF');
var indexGroups = client.initIndex('groupsGF');

module.exports = {indexEvents,indexGroups}
// export default indexGroups