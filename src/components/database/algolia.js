import algoliasearch from 'algoliasearch';
import equal from 'fast-deep-equal';
import union from 'lodash/union';
import {keys} from 'ramda';
import moment from 'moment';
import Config from 'react-native-config';

const client = algoliasearch('F4SW2K5A54', '567ba66321018b3bdc5e90fc9e0e26d3', {
  timeouts: {
    connect: 1,
    read: 2,
    write: 30,
  },
});

let indexEvents = client.initIndex('prod_events');
let indexEventsName = 'prod_events';
let indexGroups = client.initIndex('prod_groups');
let indexGroupsName = 'prod_groups';
let indexUsers = client.initIndex('prod_users');
let indexUsersName = 'prod_users';
let indexDiscussions = client.initIndex('prod_discussions');
let indexDiscussionsName = 'prod_discussions';
let indexChallenges = client.initIndex('prod_challenges');
let indexChallengesName = 'prod_challenges';

if (Config.ENV === 'dev') {
  indexEvents = client.initIndex('dev_events');
  indexEventsName = 'dev_events';
  indexGroups = client.initIndex('dev_groups');
  indexGroupsName = 'dev_groups';
  indexUsers = client.initIndex('dev_users');
  indexUsersName = 'dev_users';
  indexDiscussions = client.initIndex('dev_discussions');
  indexDiscussionsName = 'dev_discussions';
  indexChallenges = client.initIndex('dev_challenges');
  indexChallengesName = 'dev_challenges';
}

async function getMyGroups(userID, filterSport, location, radiusSearch) {
  await client.clearCache();
  const filterOrganizer =
    'info.organizer:' + userID + ' OR allMembers:' + userID;
  const filters = filterOrganizer + filterSport;
  if (location) {
    var {hits} = await indexGroups.search('', {
      filters: filters,
      aroundLatLng: location ? location.lat + ',' + location.lng : '',
      aroundRadius: radiusSearch * 1000,
      hitsPerPage: 1000,
    });
  } else {
    var {hits} = await indexGroups.search('', {
      filters: filters,
      hitsPerPage: 1000,
    });
  }
  return hits;
}
function filterLeagueEventsFromGroups(event, league) {
  if (league === 'all') return true;
  return event.info.league === league;
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
      events = union(events, keys(groups[i].events));
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
  await client.clearCache();
  let {hits} = await indexEvents.search('', {
    filters: filters,
    aroundLatLng: location.lat + ',' + location.lng,
    aroundRadius: radiusSearch * 1000,
    hitsPerPage: 1000,
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
  await client.clearCache();
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
  var {hits} = await indexEvents.search('', {
    aroundLatLng: location.lat + ',' + location.lng,
    aroundRadius: radiusSearch * 1000,
    hitsPerPage: 1000,
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
  console.log('results events around', hits);

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
  let filterAttendees = userID + ' OR info.organizer:' + userID + ' AND ';

  let filterDate = 'date_timestamp>' + Number(new Date());
  if (filterDateName === 'past')
    filterDate = 'date_timestamp<' + Number(new Date());
  await client.clearCache();

  const queries = [
    {
      indexName: indexEventsName,
      params: {
        hitsPerPage: 1000,
        filters: 'allAttendees:' + filterAttendees + filterDate,
      },
    },
    {
      indexName: indexChallengesName,
      params: {
        hitsPerPage: 1000,
        filters: 'allMembers:' + filterAttendees + filterDate,
      },
    },
  ];
  let {results} = await client.multipleQueries(queries);
  let array = [];
  results = results.map((result) => array.concat(result.hits));

  var arrayResult = [].concat.apply([], results);
  arrayResult = arrayResult
    .sort(function(a, b) {
      return a.date_timestamp - b.date_timestamp;
    })
    .reduce(function(result, item) {
      result[item.objectID] = item;
      return result;
    }, {});
  return arrayResult;
};

module.exports = {
  indexEvents,
  indexGroups,
  indexUsers,
  getEventPublic,
  indexDiscussions,
  indexChallenges,
  getMyGroups,
  getMyEvents,
  client,
};
