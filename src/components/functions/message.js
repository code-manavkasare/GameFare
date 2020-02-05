import firebase from 'react-native-firebase';
import moment from 'moment';
import {indexDiscussions, getMyGroups, getMyEvents} from '../database/algolia';
import union from 'lodash/union';

function discussionObj(members, nameDiscussion, firstMessageExists) {
  return {
    title: nameDiscussion,
    allMembers: members.map((member) => member.id),
    numberMembers: members.length,
    firstMessageExists: firstMessageExists,
    members: members,
    messages: {},
    type: 'users',
  };
}

async function createDiscussion(members, nameDiscussion, firstMessageExists) {
  var newDiscussion = discussionObj(
    Object.values(members),
    nameDiscussion,
    firstMessageExists,
  );

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
      usersRead: {
        [user.id]: true,
      },
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

  // search for persnal conversations
  const {hits} = await indexDiscussions.search({
    query: '',
    filters: 'allMembers:' + userID,
  });

  // search for groups discussions
  var myGroups = await getMyGroups(userID, '');
  var groupsDiscussions = myGroups.map((group) => group.discussions[0]);
  var {results} = await indexDiscussions.getObjects(groupsDiscussions);

  // search for events discussions
  const myEvents = await getMyEvents(userID,'future');
  const eventsDiscussions = Object.values(myEvents)
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

function checkMessageRead(message, userID) {
  if (!message) return false;
  if (!message.usersRead) return false;
  if (!message.usersRead[userID]) return false;
  return true;
}

function nameOtherMemberConversation(conversation, userID) {
  if (conversation.type === 'group') return conversation.title;
  if (conversation.numberMembers > 2) return 'the group';
  const infoMember = Object.values(conversation.members).filter(
    (user) => user.id !== userID,
  )[0].info;

  if (!infoMember) {
    return 'None';
  }
  return infoMember.firstname + ' ' + infoMember.lastname;
}

function titleConversation(conversation, userID) {
  let title = '';
  if (conversation.type === 'group') title = conversation.title;
  else if (conversation.numberMembers === 2)
    title = nameOtherMemberConversation(conversation, userID);
  else {
    const members = Object.values(conversation.members).filter(
      (member) => member.id !== userID,
    );
    for (var i in members) {
      if (i === '0') title = members[i].info.firstname;
      else title = title + ', ' + members[i].info.firstname;
    }
  }

  if (title.length > 20) title = title.slice(0, 20) + '...';
  return title;
}

export {
  createDiscussion,
  searchDiscussion,
  sendNewMessage,
  loadMyDiscusions,
  checkMessageRead,
  titleConversation,
  nameOtherMemberConversation,
};
