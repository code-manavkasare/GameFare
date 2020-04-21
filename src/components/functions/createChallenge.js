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
  let teams = {};
  console.log('createChallengeObj', challenge);
  if (challenge.teamsData.typeChallengeTeam) teams = challenge.teamsData.teams;
  else {
    const idTeamOponent = generateID();
    const idTeamUser = generateID();
    teams = {
      [idTeamOponent]: {
        ...challenge.teamsData.oponent,
        id: idTeamOponent,
      },
      [idTeamUser]: {
        id: idTeamUser,
        captain: {
          id: userID,
          info: infoUser,
        },
        members: {
          [userID]: {
            id: userID,
            objectID: userID,
            info: infoUser,
          },
        },
      },
    };
  }
  let newChallenge = {
    ...challenge,
    challenge: true,
    info: {
      ...challenge.info,
      organizer: userID,
      individual: !challenge.teamsData.typeChallengeTeam,
    },
    teams: teams,
  };
  delete newChallenge['teamsData'];

  let totalMembersArray = Object.values(teams)
    .filter((team) => team.members)
    .filter(
      (team) =>
        Object.values(team.members).filter((member) => !member.index).length !==
        0,
    )
    .map((team) => keys(team.members));
  const arrayAllMembers = [].concat.apply([], totalMembersArray);
  const allMembers = arrayAllMembers.reduce(function(result, item) {
    result[item] = true;
    return result;
  }, {});
  return {
    ...newChallenge,
    date_timestamp: moment(newChallenge.date.start).valueOf(),
    end_timestamp: moment(newChallenge.date.end).valueOf(),
    allMembers: allMembers,
  };
}

async function createChallenge(challenge, userID, infoUser) {
  const pictureUri = await uploadPictureFirebase(
    challenge.info.image,
    'challenges/' + generateID(),
  );

  if (!pictureUri) return false;

  let newChallenge = await createChallengeObj(challenge, userID, infoUser);
  console.log('newChallenge', newChallenge);
  // return false;

  newChallenge.images = [pictureUri];
  const discussionID = generateID();
  newChallenge.discussions = [discussionID];
  const {key} = await firebase
    .database()
    .ref('challenges')
    .push(newChallenge);
  newChallenge.objectID = key;

  let updates = {};
  updates[`challenges/${key}`] = {eventID: key};
  updates[`discussions/${discussionID}`] = createDiscussionEventGroup(
    discussionID,
    key,
    pictureUri,
    newChallenge.info.name,
    {
      id: userID,
      info: infoUser,
    },
  );

  await firebase
    .database()
    .ref()
    .update(updates);

  await subscribeToTopics([userID, 'all', key]);
  refreshTokenOnDatabase(userID);

  return newChallenge;
}

const isUserAlreadyMember = (challenge, userID, userConnected) => {
  if (!userConnected) return false;

  if (challenge.info.organizer === userID) return true;
  const {teams} = challenge;
  const allMembers = Object.values(teams)
    .filter((team) => team.members)
    .map((team) => Object.values(team.members));
  const arrayAllMembers = [].concat.apply([], allMembers);

  if (isUserCaptainOfTeam(challenge, userID, userConnected))
    return (
      arrayAllMembers.filter(
        (member) => member.id === userID && member.status === 'confirmed',
      ).length !== 0
    );

  return arrayAllMembers.filter((member) => member.id === userID).length !== 0;
};

const isUserCaptainOfTeam = (challenge, userID, userConnected) => {
  if (!userConnected) return false;

  const {teams} = challenge;
  return (
    Object.values(teams).filter((team) => team.captain.id === userID).length !==
    0
  );
};

const isUserContactUser = (challenge, userID) => {
  const {teams} = challenge;
  const allMembers = Object.values(teams)
    .filter((team) => team.members)
    .map((team) => Object.values(team.members));
  const arrayAllMembers = [].concat.apply([], allMembers);
  const allMembersGamefare = arrayAllMembers.filter((member) => !member.index);
  return !allMembersGamefare.filter((member) => member.id === userID);
};

const listContactUser = (challenge) => {
  const {teams} = challenge;
  const allMembers = Object.values(teams)
    .filter((team) => team.members)
    .map((team) =>
      Object.values(team.members).map((member) => {
        return {...member, team: team};
      }),
    );
  let arrayAllMembers = [].concat.apply([], allMembers);
  return arrayAllMembers.filter((member) => member.index);
};

const allTeamsConfirmed = (challenge, userID) => {
  const {teams} = challenge;
  if (!teams) return false;
  return (
    Object.values(teams).filter(
      (team) =>
        team.captain.id !== challenge.info.organizer &&
        team.status !== 'confirmed',
    ).length === 0
  );
};

module.exports = {
  createChallenge,
  isUserAlreadyMember,
  isUserContactUser,
  isUserCaptainOfTeam,
  listContactUser,
  allTeamsConfirmed,
};
