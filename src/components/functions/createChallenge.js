import firebase from 'react-native-firebase';
import axios from 'axios';
import {keys} from 'ramda';
import moment from 'moment';
import Config from 'react-native-config';

import {uploadPictureFirebase} from '../functions/pictures';
import {
  subscribeToTopics,
  refreshTokenOnDatabase,
} from '../functions/notifications';
import {indexEvents} from '../database/algolia';
import {createDiscussionEventGroup} from '../functions/message';

function generateID() {
  return (
    Math.random()
      .toString(36)
      .substring(2) + Date.now().toString(36)
  );
}

function createNewTeam(captain, members, status, amountPaid) {
  const idNewTeam = generateID();
  delete captain['_highlightResult'];
  return {
    [idNewTeam]: {
      captain: captain,
      id: idNewTeam,
      status: status,
      members: members,
      amountPaid: amountPaid,
    },
  };
}

function createTeamsFromCaptains(captains) {
  let teams = {};
  for (var i in Object.values(captains)) {
    let captain = Object.values(captains)[i];
    teams = {
      ...teams,
      ...createNewTeam(captain, {[captain.id]: captain}, 'pending', 'pending'),
    };
  }
  return teams;
}

async function createChallengeObj(challenge, userID, infoUser) {
  let newChallenge = {
    ...challenge,
    challenge: true,
    info: {
      ...challenge.info,
      organizer: userID,
    },
  };

  const teamOrganizer = createNewTeam(
    {
      info: infoUser,
      id: userID,
    },
    {
      [userID]: {
        info: infoUser,
        id: userID,
      },
    },
    'confirmed',
    challenge.price.amount,
  );
  console.log('challenge creation', challenge);
  const teamsFromCaptains = createTeamsFromCaptains(challenge.captains);
  const teams = {
    ...teamsFromCaptains,
    ...teamOrganizer,
  };
  delete newChallenge['captains'];

  let totalMembersArray = Object.values(teams).map((team) =>
    keys(team.members),
  );
  const arrayAllMembers = [].concat.apply([], totalMembersArray);
  return {
    ...newChallenge,
    date_timestamp: moment(newChallenge.date.start).valueOf(),
    end_timestamp: moment(newChallenge.date.end).valueOf(),
    teams: teams,
    allMembers: arrayAllMembers,
  };
}

async function createChallenge(challenge, userID, infoUser) {
  const pictureUri = await uploadPictureFirebase(
    challenge.info.image,
    'challenges/' + generateID(),
  );

  if (!pictureUri) return false;

  let newChallenge = await createChallengeObj(challenge, userID, infoUser);

  newChallenge.images = [pictureUri];
  const discussionID = generateID();
  newChallenge.discussions = [discussionID];
  const {key} = await firebase
    .database()
    .ref('challenges')
    .push(newChallenge);
  newChallenge.objectID = key;

  await firebase
    .database()
    .ref('challenges/' + key)
    .update({eventID: key});

  await firebase
    .database()
    .ref('discussions/' + discussionID)
    .update(
      createDiscussionEventGroup(
        discussionID,
        key,
        pictureUri,
        newChallenge.info.name,
        {
          id: userID,
          info: infoUser,
        },
      ),
    );

  await subscribeToTopics([userID, 'all', key]);
  refreshTokenOnDatabase(userID);

  return newChallenge;
}

async function checkUserAttendingEvent(userID, data) {
  var filterAttendees =
    'allAttendees:' +
    userID +
    ' OR allCoaches:' +
    userID +
    ' OR info.organizer:' +
    userID;
  // indexEvents.clearCache();
  var {hits} = await indexEvents.search({
    query: data.objectID,
    filters: filterAttendees,
  });
  if (hits.length !== 0 && userID === data.info.organizer) {
    return {
      response: false,
      message:
        'You are the organizer of this event. You cannot attend your own event.',
    };
  } else if (hits.length !== 0) {
    return {
      response: false,
      message:
        'You are already attending this event. You cannot join it again.',
    };
  }
  return {response: true};
}

function arrayTeams(members, userID, organizer) {
  if (!members) return [];
  if (organizer === userID) return Object.values(members);
  return Object.values(members).filter(
    (teams) => teams.status === 'confirmed' || teams.captain.id === userID,
  );
}

module.exports = {
  createChallenge,
  arrayTeams,
};
