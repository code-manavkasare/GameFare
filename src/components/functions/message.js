import database from '@react-native-firebase/database';
import moment from 'moment';
import {includes} from 'ramda';
import {indexDiscussions, client} from '../database/algolia';
import SendSMS from 'react-native-sms';

import {store} from '../../../reduxStore';
import {
  setConversation,
  setConversationBinded,
} from '../../actions/conversationsActions';

const generateID = () => {
  return (
    Math.random()
      .toString(36)
      .substring(2) + Date.now().toString(36)
  );
};

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
  console.log('createDiscussion', members);
  const membersObj = Object.values(members).reduce(function(result, item) {
    result[item.id] = item;
    return result;
  }, {});
  let newDiscussion = discussionObj(
    membersObj,
    nameDiscussion,
    firstMessageExists,
  );

  const {key} = await database()
    .ref('discussions/')
    .push(newDiscussion);
  console.log('key', key);

  newDiscussion = {
    ...newDiscussion,
    objectID: key,
    id: key,
  };
  console.log('newDiscussion', newDiscussion);
  return newDiscussion;
}

async function sendNewMessage(discusssionID, user, text, images) {
  await database()
    .ref('messagesCoachSession/' + discusssionID)
    .push({
      user: user,
      text: text,
      images: images,
      createdAt: new Date(),
      timeStamp: Date.now(),
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

function nameOtherMemberConversation(userID, members) {
  if (Object.values(members).length === 1) return 'yourself';
  if (Object.values(members).length > 2) return 'the team';
  const infoMember = Object.values(members).filter(
    (user) => user.id !== userID,
  )[0].info;

  if (!infoMember) {
    return 'None';
  }
  return infoMember.firstname + ' ' + infoMember.lastname;
}

const sendSMSFunction = async (phoneNumbers, message) => {
  let args = {
    body: message,
    recipients: phoneNumbers,
    successTypes: ['sent', 'queued'],
    allowAndroidSendWithoutReadPermission: true,
  };
  console.log('args', args);
  return new Promise((resolve, reject) => {
    SendSMS.send(args, (completed, cancelled, error) => {
      resolve({completed, cancelled, error});
    });
  });
};

const openDiscussion = async (arrayUsers, idDiscussion) => {
  const users = arrayUsers.map((user) => user.id);
  var discussion = await searchDiscussion(users, users.length);
  if (!discussion) {
    discussion = await createDiscussion(arrayUsers, 'General', false);
    if (!discussion) {
      return false;
    }
  }

  return discussion;
};

const bindConversation = (conversationId) => {
  const gamefareUser = store.getState().message.gamefareUser;
  console.log('bindConversation', conversationId);
  database()
    .ref('messagesCoachSession/' + conversationId)
    .on('value', async function(snap) {
      let messages = snap.val();

      if (!messages)
        messages = {
          ['noMessage']: {
            user: gamefareUser,
            text: 'Write the first message.',
            createdAt: new Date(),
            id: 'noMessage',
            timeStamp: moment().valueOf(),
          },
        };
      messages = Object.keys(messages)
        .map((id) => ({
          id,
          ...messages[id],
        }))
        .sort((a, b) => a.timeStamp - b.timeStamp)
        .reverse()
        .reduce(function(result, item) {
          result[item.id] = item;
          return result;
        }, {});

      store.dispatch(setConversation({messages, objectID: conversationId}));
      store.dispatch(
        setConversationBinded({id: conversationId, isBinded: true}),
      );
    });
};

const unbindConversation = async (conversationId) => {
  console.log('unbindConversation', conversationId);
  const isConversationBinded = store.getState().bindedConversations[
    conversationId
  ];
  if (isConversationBinded) {
    await database()
      .ref('discussions/' + conversationId)
      .off();
    store.dispatch(
      setConversationBinded({id: conversationId, isBinded: false}),
    );
  }
};

export {
  createDiscussion,
  createDiscussionEventGroup,
  searchDiscussion,
  sendNewMessage,
  loadMyDiscusions,
  openDiscussion,
  sendSMSFunction,
  nameOtherMemberConversation,
  bindConversation,
  unbindConversation,
};
