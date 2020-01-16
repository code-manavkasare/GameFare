import firebase from 'react-native-firebase';
import moment from 'moment';
import {indexDiscussions} from '../database/algolia';

function discussionObj(members, nameDiscussion) {
  return {
    title: nameDiscussion,
    allMembers: members.map((member) => member.id),
    members: members,
    messages: {},
    type: 'users',
  };
}

async function createDiscussion(members, nameDiscussion) {
  var newDiscussion = discussionObj(members, nameDiscussion);
  console.log('newDiscussion', newDiscussion);
  // return false;
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

async function searchDiscussion(ids) {
  var filterMembers = '';
  var prefix = ' AND ';
  for (var id in ids) {
    if (Number(id) === 0) {
      prefix = '';
    } else {
      prefix = ' AND ';
    }
    filterMembers =
      filterMembers + prefix + 'allMembers: ' + Object.values(ids)[id];
  }

  const {hits} = await indexDiscussions.search({
    filters: filterMembers,
  });
  if (hits.length === 0) return false;
  return hits[0];
}

export {createDiscussion, searchDiscussion, sendNewMessage};
