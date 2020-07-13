import database from '@react-native-firebase/database';
import moment from 'moment';
import {includes} from 'ramda';
import {indexDiscussions, client} from '../database/algolia';
import SendSMS from 'react-native-sms';

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

  const {key} = await database()
    .ref('discussions/')
    .push(newDiscussion);
  newDiscussion.objectID = key;
  newDiscussion.id = key;
  return newDiscussion;
}

async function sendNewMessage(discusssionID, user, text, images) {
  await database()
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
  const {hits} = await indexDiscussions.search('', {
    filters: filterMembers,
  });
  if (hits.length === 0) return false;
  return hits[0];
}

const filterBlockedUserDiscussions = (discussions, blockedUsers) => {
  //TODO: to clean/concat, could be easier
  let discussionsFiltered = discussions;
  for (let [key, discussion] of Object.entries(discussionsFiltered)) {
    if ((discussion.allMembers.length = 2)) {
      Object.keys(blockedUsers).map((blockedUser) => {
        includes(blockedUser, discussion.allMembers) &&
          delete discussionsFiltered[key];
      });
    }
  }
  return discussionsFiltered;
};

async function loadMyDiscusions(userID, searchInput, blockedUsers) {
  await client.clearCache();
  let {hits} = await indexDiscussions.search(searchInput, {
    filters: `firstMessageExists=1 AND allMembers:${userID}`,
    hitsPerPage: 10000,
  });
  let discussions = hits.reduce(function(result, item) {
    result[item.objectID] = item;
    return result;
  }, {});

  if (blockedUsers) {
    discussions = filterBlockedUserDiscussions(discussions, blockedUsers);
  }

  return discussions;
}

function checkMessageRead(message, userID) {
  if (!message) return false;
  if (!message.usersRead) return false;
  if (!message.usersRead[userID]) return false;
  return true;
}

function nameOtherMemberConversation(conversation, userID, members) {
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

const sendSMSFunction = async (phoneNumbers, message) => {
  let args = {
    body: message,
    recipients: phoneNumbers,
    successTypes: ['sent', 'queued'],
    allowAndroidSendWithoutReadPermission: true,
  };
  return new Promise((resolve, reject) => {
    SendSMS.send(args, (completed, cancelled, error) => {
      resolve({completed, cancelled, error});
    });
  });
};

const openDiscussion = async (arrayUsers) => {
  const users = arrayUsers.map((user) => user.id);
  var discussion = await searchDiscussion(users, users.length);

  if (!discussion) {
    discussion = await createDiscussion(users, 'General', false);
    if (!discussion) {
      return false;
    }
  }
  return discussion;
};

export {
  createDiscussion,
  createDiscussionEventGroup,
  searchDiscussion,
  sendNewMessage,
  loadMyDiscusions,
  checkMessageRead,
  openDiscussion,
  titleConversation,
  sendSMSFunction,
  nameOtherMemberConversation,
};
