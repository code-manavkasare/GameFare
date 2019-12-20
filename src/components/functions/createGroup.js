import React, {Component} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';

import {uploadPictureFirebase} from '../functions/pictures';
import {subscribeToTopics} from '../functions/notifications';
import firebase from 'react-native-firebase';

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

function newDiscussion(discussionID, groupID, image, nameGroup) {
  return {
    id: discussionID,
    title: nameGroup,
    members: {},
    messages: {},
    type: 'group',
    groupID: groupID,
    image: image,
  };
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
    .update(newDiscussion(discussionID, key, pictureUri, group.info.name));
  group.objectID = key;

  await subscribeToTopics([userID, 'all', key]);
  return group;
}

module.exports = {createGroup};
