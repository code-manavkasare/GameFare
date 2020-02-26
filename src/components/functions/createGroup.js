import React, {Component} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import firebase from 'react-native-firebase';

import {uploadPictureFirebase} from '../functions/pictures';
import {addMemberDiscussion} from './createEvent';
import {
  subscribeToTopics,
  refreshTokenOnDatabase,
} from '../functions/notifications';
import {createDiscussionEventGroup} from '../functions/message';

function generateID() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

async function createGroup(data, userID, infoUser) {
  var pictureUri = await uploadPictureFirebase(
    data.img,
    'groups/' + generateID(),
  );
  if (!pictureUri) return false;
  var group = {
    ...data,
    info: {
      ...data.info,
      public: !data.info.public,
      organizer: userID,
    },
    pictures: [pictureUri],
    organizer: {
      id: userID,
      info: infoUser,
    },
  };
  delete group['img'];
  const discussionID = generateID();
  group.discussions = [discussionID];
  var {key} = await firebase
    .database()
    .ref('groups')
    .push(group);
  await firebase
    .database()
    .ref('discussions/' + discussionID)
    .update(
      createDiscussionEventGroup(
        discussionID,
        key,
        pictureUri,
        group.info.name,
        {
          id: userID,
          info: infoUser,
        },
      ),
    );
  group.objectID = key;
  refreshTokenOnDatabase(userID);
  await subscribeToTopics([userID, 'all', key]);
  return group;
}

async function subscribeUserToGroup(
  groupID,
  userID,
  infoUser,
  status,
  discussionID,
) {
  const user = {
    userID: userID,
    id: userID,
    status: status,
    info: infoUser,
  };
  refreshTokenOnDatabase(userID);
  await firebase
    .database()
    .ref('groups/' + groupID + '/members/' + userID)
    .update(user);
  if (user.status === 'confirmed') {
    await addMemberDiscussion(discussionID, user);
  }
  return user;
}

module.exports = {createGroup, generateID, subscribeUserToGroup};
