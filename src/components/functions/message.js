import firebase from 'react-native-firebase';
import moment from 'moment';
import {
  indexDiscussions,
  getMyGroups,
  getMyEvents,
  client,
} from '../database/algolia';
import R from 'reactotron-react-native';

function discussionObj(members, nameDiscussion, firstMessageExists) {
  return {
    title: nameDiscussion,
    allMembers: Object.values(members).map((member) => member.id),
    numberMembers: Object.values(members).length,
    firstMessageExists: firstMessageExists,
    members: members,
    messages: {},
    type: 'users',
  };
}

const createDiscussionEventGroup = (
  discussionID,
  groupID,
  image,
  nameGroup,
  initialMember,
) => {
  return {
    id: discussionID,
    title: nameGroup,
    members: {
      [initialMember.id]: initialMember,
    },
    allMembers: [initialMember.id],
    messages: {},
    type: 'group',
    groupID: groupID,
    image: image,
  };
};

async function createDiscussion(members, nameDiscussion, firstMessageExists) {
  const membersObj = Object.values(members).reduce(function(result, item) {
    result[item.id] = item;
    return result;
  }, {});
  var newDiscussion = discussionObj(
    membersObj,
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
  // await indexDiscussions.clearCache();
  await client.clearCache();
  console.log('searchDIscussion', {ids, numberMembers});
  var filterMembers = '';
  var prefix = ' AND ';
  for (var id in ids) {
    if (Number(id) === 0) {
      prefix = '';
    } else {
      prefix = ' AND ';
    }
    filterMembers =
      filterMembers + prefix + 'allMembers:' + Object.values(ids)[id];
  }
  filterMembers = filterMembers + ' AND numberMembers:' + numberMembers;
  console.log('filterMembers', filterMembers);
  const {hits} = await indexDiscussions.search('', {
    filters: filterMembers,
  });
  console.log('hits', hits);
  if (hits.length === 0) return false;
  return hits[0];
}

async function loadMyDiscusions(userID, searchInput) {
  // indexDiscussions.clearCache();
  await client.clearCache();
  let {hits} = await indexDiscussions.search(searchInput, {
    filters: 'allMembers:' + userID + ' AND firstMessageExists=1',
    hitsPerPage: 10000,
  });
  let discussions = hits.reduce(function(result, item) {
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

function nameOtherMemberConversation(conversation, userID, members) {
  R.log('members', members);
  if (conversation.type === 'group') return conversation.title;
  if (conversation.numberMembers > 2) return 'the group';
  const infoMember = Object.values(members).filter(
    (user) => user.id !== userID,
  )[0].info;

  if (!infoMember) {
    return 'None';
  }
  return infoMember.firstname + ' ' + infoMember.lastname;
}

const titleConversation = (conversation, userID, members) => {
  if (members === {}) return '';
  let title = '';
  if (conversation.type === 'group') title = conversation.title;
  else if (conversation.numberMembers === 2)
    title = nameOtherMemberConversation(conversation, userID, members);
  else {
    const membersFiltered = Object.values(members).filter(
      (member) => member.id !== userID,
    );
    for (var i in membersFiltered) {
      if (i === '0') title = membersFiltered[i].info.firstname;
      else title = title + ', ' + membersFiltered[i].info.firstname;
    }
  }

  if (title.length > 20) title = title.slice(0, 20) + '...';
  return title;
};

export {
  createDiscussion,
  createDiscussionEventGroup,
  searchDiscussion,
  sendNewMessage,
  loadMyDiscusions,
  checkMessageRead,
  titleConversation,
  nameOtherMemberConversation,
};
