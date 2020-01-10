import algoliasearch from 'algoliasearch/reactnative';
import equal from 'fast-deep-equal';
import union from 'lodash/union';

const client = algoliasearch('EX9TV715SD', '36bc4371bcdde61e2e4d5f05c8a274ce');
const indexEvents = client.initIndex('eventsGF');
const indexPastEvents = client.initIndex('pastEventsGF');
const indexGroups = client.initIndex('groupsGF');
const indexDiscussions = client.initIndex('discussionsGF');

async function getMyGroups(userID, filterSport, location, radiusSearch) {
  indexGroups.clearCache();
  console.log('get my groups');
  var filterOrganizer = 'info.organizer:' + userID + ' OR allMembers:' + userID;
  var filters = filterOrganizer + filterSport;
  if (location) {
    var {hits} = await indexGroups.search({
      query: '',
      filters: filters,
      aroundLatLng: location ? location.lat + ',' + location.lng : '',
      aroundRadius: radiusSearch * 1000,
    });
  } else {
    var {hits} = await indexGroups.search({
      query: '',
      filters: filters,
    });
  }

  console.log('my groups got', hits);
  return hits;
}

async function getEventsFromGroups(
  groups,
  location,
  radiusSearch,
  userID,
  sport,
) {
  var events = [];
  for (var i in groups) {
    if (groups[i].events) {
      events = union(events, groups[i], groups[i].events);
    }
  }
  let filterIds = '';
  let prefix = ' AND ';
  for (var j in events) {
    console.log('j');
    console.log(j);
    if (Number(j) === 0) prefix = '';
    else prefix = ' AND ';
    filterIds = filterIds + prefix + 'objectID:' + Object.values(events)[j];
  }
  console.log('dfjydjkfgjkdfgdg');
  console.log(filterIds);
  console.log(sport);
  var filterUser =
    'NOT info.organizer:' + userID + ' AND NOT allAttendees:' + userID;
  let prefix2 = ' AND ';
  if (filterIds === '') prefix2 = '';
  const {hits} = await indexEvents.search({
    filters: filterIds + prefix2 + filterUser + ' AND info.sport:' + sport,
    aroundLatLng: location.lat + ',' + location.lng,
    aroundRadius: radiusSearch * 1000,
  });
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
  if (league === 'all' || league === '') {
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
  console.log('bim userID', userID);
  var filterUser =
    ' AND NOT info.organizer:' + userID + ' AND NOT allAttendees:' + userID;
  if (userID === '') filterUser = '';

  console.log('leagueFilter', leagueFilter);
  console.log(sport);
  console.log(filterUser);
  console.log(withFilters);

  var {hits} = await indexEvents.search({
    aroundLatLng: location.lat + ',' + location.lng,
    aroundRadius: radiusSearch * 1000,
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
  console.log('le hits');
  console.log(hits);

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
    console.log('my groupsss');
    console.log(myGroups);
    eventsMyGroups = await getEventsFromGroups(
      myGroups,
      location,
      radiusSearch,
      userID,
      sport,
    );
  }
  console.log(eventsMyGroups);
  allEventsPublic = {
    ...allEventsPublic,
    ...eventsMyGroups,
  };
  console.log('allEentsPublic', allEventsPublic);
  return allEventsPublic;
};

const getMyEvents = async (userID) => {
  let filterAttendees = '';
  filterAttendees =
    'allAttendees:' +
    userID +
    ' OR allCoaches:' +
    userID +
    ' OR info.organizer:' +
    userID +
    ' AND ';

  var filterDate = 'date_timestamp>' + Number(new Date());
  indexEvents.clearCache();
  var {hits} = await indexEvents.search({
    query: '',
    filters: filterAttendees + filterDate,
  });
  // var allEvents = hits.reduce(function(result, item) {
  //   result[item.objectID] = item;
  //   return result;
  // }, {});
  return hits;
};

module.exports = {
  indexEvents,
  indexGroups,
  indexPastEvents,
  getEventPublic,
  indexDiscussions,
  getMyGroups,
  getMyEvents,
};
