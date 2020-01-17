import firebase from 'react-native-firebase';
import moment from 'moment';
import {indexDiscussions, getMyGroups, getMyEvents} from '../database/algolia';
import union from 'lodash/union';

function discussionObj(members, nameDiscussion) {
  return {
    title: nameDiscussion,
    allMembers: members.map((member) => member.id),
    numberMembers: members.length,
    members: members,
    messages: {},
    type: 'users',
  };
}

async function createDiscussion(members, nameDiscussion) {
  var newDiscussion = discussionObj(Object.values(members), nameDiscussion);

  const {key} = await firebase
    .database()
    .ref('discussions/')
    .push(newDiscussion);
  newDiscussion.objectID = key;
  newDiscussion.id = key;
  return newDiscussion;
}

async function sendNewMessage(discusssionID, user, text, images) {
  await firebase
    .database()
    .ref('discussions/' + discusssionID + '/messages')
    .push({
      user: user,
      text: text,
      images: images,
      createdAt: new Date(),
      timeStamp: moment().valueOf(),
    });
  return true;
}

async function searchDiscussion(ids, numberMembers) {
  var filterMembers = '';
  var prefix = ' AND ';
  for (var id in ids) {
    if (Number(id) === 0) {
      prefix = '';
    } else {
      prefix = ' AND ';
    }
    filterMembers =
      filterMembers +
      prefix +
      'allMembers: ' +
      Object.values(ids)[id] +
      ' AND numberMembers:' +
      numberMembers;
  }

  const {hits} = await indexDiscussions.search({
    filters: filterMembers,
  });
  if (hits.length === 0) return false;
  return hits[0];
}

async function loadMyDiscusions(userID) {
  indexDiscussions.clearCache();
  console.log('loadMyDiscusions 2');

  // search for persnal conversations
  var {hits} = await indexDiscussions.search({
    query: '',
    filters: 'allMembers:' + userID,
  });

  // search for groups discussions
  var myGroups = await getMyGroups(userID, '');
  var groupsDiscussions = myGroups.map((group) => group.discussions[0]);
  var {results} = await indexDiscussions.getObjects(groupsDiscussions);

  // search for events discussions
  var myEvents = await getMyEvents(userID);
  var eventsDiscussions = myEvents
    .map((event) => {
      if (event.discussions) return event.discussions[0];
    })
    .filter((event) => event);
  var getDiscussionsEvent = await indexDiscussions.getObjects(
    eventsDiscussions,
  );
  getDiscussionsEvent = getDiscussionsEvent.results;

  let discussions = union(results, hits, getDiscussionsEvent).filter(
    (discussion) => discussion.firstMessageExists,
  );
  discussions = discussions.reduce(function(result, item) {
    result[item.objectID] = item;
    return result;
  }, {});
  return discussions;
}

export {createDiscussion, searchDiscussion, sendNewMessage, loadMyDiscusions};
