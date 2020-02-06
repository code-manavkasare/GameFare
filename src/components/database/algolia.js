import algoliasearch from 'algoliasearch/reactnative';
import equal from 'fast-deep-equal';
import union from 'lodash/union';
import moment from 'moment';

const client = algoliasearch('F4SW2K5A54', '567ba66321018b3bdc5e90fc9e0e26d3');
const indexEvents = client.initIndex('prod_events');
const indexPastEvents = client.initIndex('prod_pastEvents');
const indexGroups = client.initIndex('prod_groups');
const indexUsers = client.initIndex('prod_users');
const indexDiscussions = client.initIndex('prod_discussions');

async function getMyGroups(userID, filterSport, location, radiusSearch) {
  await indexGroups.clearCache();
  const filterOrganizer =
    'info.organizer:' + userID + ' OR allMembers:' + userID;
  const filters = filterOrganizer + filterSport;
  if (location) {
    var {hits} = await indexGroups.search({
      filters: filters,
      aroundLatLng: location ? location.lat + ',' + location.lng : '',
      aroundRadius: radiusSearch * 1000,
    });
  } else {
    var {hits} = await indexGroups.search({
      filters: filters,
    });
  }
  return hits;
}
function filterLeagueEventsFromGroups(event, league) {
  if (league === 'all') return true;
  return event.info === league;
}
async function getEventsFromGroups(
  groups,
  location,
  radiusSearch,
  userID,
  sport,
  league,
) {
  var events = [];
  for (var i in groups) {
    if (groups[i].events) {
      events = union(events, groups[i].events);
    }
  }
  let filterIds = '';
  let prefix = ' OR ';
  for (var j in events) {
    if (Number(j) === 0) prefix = '';
    else prefix = ' OR ';
    filterIds = filterIds + prefix + 'objectID:' + Object.values(events)[j];
  }
  var filterUser =
    'NOT info.organizer:' + userID + ' AND NOT allAttendees:' + userID;
  let prefix2 = ' AND ';
  if (filterIds === '') prefix2 = '';

  const filters = filterIds + prefix2 + filterUser + ' AND info.sport:' + sport;
  await indexEvents.clearCache();
  let {hits} = await indexEvents.search({
    filters: filters,
    aroundLatLng: location.lat + ',' + location.lng,
    aroundRadius: radiusSearch * 1000,
  });
  if (filterIds === '') hits = [];
  hits = hits.filter(
    (event) =>
      event.end_timestamp > moment().valueOf() &&
      filterLeagueEventsFromGroups(event, league),
  );
  const eventsMyGroups = hits.reduce(function(result, item) {
    result[item.objectID] = item;
    return result;
  }, {});
  return eventsMyGroups;
}

const getEventPublic = async (
  location,
  sport,
  league,
  filters,
  userID,
  radiusSearch,
) => {
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
    aroundRadius: radiusSearch * 1000,
    query: '',
    filters:
      'info.public=1' +
      ' AND info.sport:' +
      sport +
      leagueFilter +
      filterUser +
      ` AND end_timestamp > ${Date.now()}` +
      (withFilters
        ? ` AND date_timestamp:${timestampDaySelected} TO ${timestampDaySelected +
            24 * 3600 * 1000}`
        : ''),
  });

  var allEventsPublic = hits.reduce(function(result, item) {
    result[item.objectID] = item;
    return result;
  }, {});

  let eventsMyGroups = {};
  if (userID !== '') {
    const myGroups = await getMyGroups(
      userID,
      ' AND info.sport:' + sport,
      location,
      radiusSearch,
    );
    eventsMyGroups = await getEventsFromGroups(
      myGroups,
      location,
      radiusSearch,
      userID,
      sport,
      league,
    );
  }

  allEventsPublic = {
    ...allEventsPublic,
    ...eventsMyGroups,
  };

  return allEventsPublic;
};

const getMyEvents = async (userID, filterDateName) => {
  let filterAttendees =
    'allAttendees:' +
    userID +
    ' OR allCoaches:' +
    userID +
    ' OR info.organizer:' +
    userID +
    ' AND ';

  let filterDate = 'date_timestamp>' + Number(new Date());
  if (filterDateName === 'past')
    filterDate = 'date_timestamp<' + Number(new Date());
  indexEvents.clearCache();
  var {hits} = await indexEvents.search({
    query: '',
    filters: filterAttendees + filterDate,
  });
  const events = hits.reduce(function(result, item) {
    result[item.objectID] = item;
    return result;
  }, {});
  return events;
};

module.exports = {
  indexEvents,
  indexGroups,
  indexPastEvents,
  indexUsers,
  getEventPublic,
  indexDiscussions,
  getMyGroups,
  getMyEvents,
};
