import firebase from 'react-native-firebase';
import {indexDiscussions} from '../database/algolia';

function discussionObj(members, nameDiscussion) {
  return {
    title: nameDiscussion,
    allMembers: [members[0].id, members[1].id],
    members: members,
    messages: {},
    type: 'users',
  };
}

async function createDiscussion(members, nameDiscussion) {
  var newDiscussion = discussionObj(members, nameDiscussion);
  console.log('newDiscussion');
  console.log(newDiscussion);
  //   return false;
  const {key} = await firebase
    .database()
    .ref('discussions/')
    .push(newDiscussion);
  newDiscussion.objectID = key;
  newDiscussion.id = key;
  return newDiscussion;
}

async function searchDiscussion(ids) {
  console.log('searchDiscussion');
  var filterMembers = '';
  var prefix = ' AND ';
  for (var id in ids) {
    console.log(id);
    if (Number(id) === 0) {
      prefix = '';
    } else {
      prefix = ' AND ';
    }
    filterMembers =
      filterMembers + prefix + 'allMembers: ' + Object.values(ids)[id];
  }

  console.log(filterMembers);
  const {hits} = await indexDiscussions.search({
    filters: filterMembers,
  });
  console.log(hits);
  if (hits.length === 0) return false;
  return hits[0];
}

export {createDiscussion, searchDiscussion};
