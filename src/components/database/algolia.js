import algoliasearch from 'algoliasearch/reactnative';
import equal from 'fast-deep-equal';

var client = algoliasearch('EX9TV715SD', '36bc4371bcdde61e2e4d5f05c8a274ce');
var indexEvents = client.initIndex('eventsGF');
var indexPastEvents = client.initIndex('pastEventsGF');
var indexGroups = client.initIndex('groupsGF');
var indexDiscussions = client.initIndex('discussionsGF');

const getEventPublic = async (location, sport, league, filters) => {
  indexEvents.clearCache();

  var leagueFilter = ' AND info.league:' + league;
  if (league === 'all') {
    leagueFilter = '';
  }

  let timestampDaySelected = 1;
  let withFilters = false;

  if (equal(filters, {})) {
    withFilters = false;
  } else {
    withFilters = true;
    timestampDaySelected = filters.startingDay.timestamp;
  }

  //Searh Algolia, if with filter we add 24h to timestamp, to see all day event
  var {hits} = await indexEvents.search({
    aroundLatLng: location.lat + ',' + location.lng,
    aroundRadius: 20 * 1000,
    query: '',
    filters: withFilters
      ? 'info.public=1' +
        ' AND info.sport:' +
        sport +
        leagueFilter +
        ` AND date_timestamp:${timestampDaySelected} TO ${timestampDaySelected +
          24 * 3600 * 1000}`
      : 'info.public=1' + ' AND info.sport:' + sport + leagueFilter,
  });

  var allEventsPublic = hits.reduce(function(result, item) {
    result[item.objectID] = item;
    return result;
  }, {});
  console.log('allEentsPublic', allEventsPublic);
  return allEventsPublic;
};

module.exports = {
  indexEvents,
  indexGroups,
  indexPastEvents,
  getEventPublic,
  indexDiscussions,
};
