import algoliasearch from 'algoliasearch/reactnative';
import equal from 'fast-deep-equal';

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

const getEventPublic = async (location, sport, league, filters, userID) => {
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
  var filterUser =
    ' AND NOT info.organizer:' + userID + ' AND NOT allAttendees:' + userID;
  if (userID === '') filterUser = '';

  var {hits} = await indexEvents.search({
    aroundLatLng: location.lat + ',' + location.lng,
    aroundRadius: 20 * 1000,
    query: '',
    filters: withFilters
      ? 'info.public=1' +
        ' AND info.sport:' +
        sport +
        leagueFilter +
        filterUser +
        ` AND date_timestamp:${timestampDaySelected} TO ${timestampDaySelected +
          24 * 3600 * 1000}`
      : 'info.public=1' +
        ' AND info.sport:' +
        sport +
        leagueFilter +
        filterUser,
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
  getMyGroups,
};
