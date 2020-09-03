import React, {Component} from 'react';

import database from '@react-native-firebase/database';
import {createThumbnail} from 'react-native-create-thumbnail';
import ImageResizer from 'react-native-image-resizer';
import axios from 'axios';
import Config from 'react-native-config';
import StatusBar from '@react-native-community/status-bar';
import isEqual from 'lodash.isequal';

import {generateID} from './createEvent';
import {getVideoUUID} from './pictures';
import {minutes, seconds, milliSeconds} from './date';
import {shareVideosWithTeam} from './videoManagement';

import {store} from '../../../reduxStore';
import {
  setCurrentSession,
  setCurrentSessionID,
  endCurrentSession,
  unsetCurrentSession,
} from '../../actions/coachActions';
import {shareVideosWithTeams} from './videoManagement';
import {setSession, setSessionBinded} from '../../actions/coachSessionsActions';
import {setLayout} from '../../actions/layoutActions';

import {navigate, goBack, getCurrentRoute} from '../../../NavigationService';

import CardCreditCard from '../app/elementsUser/elementsPayment/CardCreditCard';
import ImageUser from '../layout/image/ImageUser';
import ButtonAcceptPayment from '../layout/buttons/ButtonAcceptPayment';
import colors from '../style/colors';

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const createCoachSession = async (user, members) => {
  const coachSessionID = generateID();
  const allMembers = Object.values(members).reduce(function(result, item) {
    result[item.id] = true;
    return result;
  }, {});
  const session = {
    objectID: coachSessionID,
    tokbox: {
      sessionID: false,
      sessionIsCreated: false,
    },
    info: {
      organizer: user.id,
    },
    createdAt: Date.now(),
    members: {
      [user.id]: {...user, isConnected: false},
      ...members,
    },
    allMembers: {[user.id]: true, ...allMembers},
  };
  await database()
    .ref(`coachSessions/${coachSessionID}`)
    .update(session);
  await store.dispatch(setSession(session));
  bindSession(session.objectID);
  return session;
};

const isUserAlone = (session) => {
  if (!session) {
    return null;
  }
  if (!session.members) {
    return true;
  }
  return (
    Object.values(session.members).filter((member) => member.isConnected)
      .length <= 1
  );
};

const isSomeoneSharingScreen = (session) => {
  if (!session) {
    return false;
  }
  if (!session.members) {
    return false;
  }
  if (
    Object.values(session.members).filter(
      (member) => member.isConnected && member.shareScreen,
    ).length > 0
  ) {
    return Object.values(session.members).filter(
      (member) => member.isConnected && member.shareScreen,
    )[0].id;
  }
  return false;
};

const userPartOfSession = (session, userID) => {
  if (!session) {
    return false;
  }
  if (!session.allMembers) {
    return false;
  }
  if (!session.allMembers[userID]) {
    return false;
  }
  return session.members[userID];
};

const displayTime = (time, displayMilliseconds) => {
  function pad(num, size) {
    var s = num + '';
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
  }
  if (displayMilliseconds) {
    return (
      pad(minutes(time), 2) +
      ':' +
      pad(seconds(time, displayMilliseconds), 2) +
      ':' +
      pad(milliSeconds(time), 2)
    );
  }

  return pad(minutes(time), 2) + ':' + pad(seconds(time), 2);
};

const startRecording = (sessionIDFirebase, streamMemberId) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/tokbox/recordingStreamId`
  ] = streamMemberId;
  updates[`coachSessions/${sessionIDFirebase}/tokbox/archiving`] = true;
  database()
    .ref()
    .update(updates);
};
const stopRecording = (sessionIDFirebase) => {
  let updates = {};
  updates[`coachSessions/${sessionIDFirebase}/tokbox/archiving`] = null;
  updates[`coachSessions/${sessionIDFirebase}/tokbox/recordingStreamId`] = null;
  database()
    .ref()
    .update(updates);
};

const toggleCloudRecording = (sessionIDFirebase, memberID, enable) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/enabled`
  ] = enable;
  database()
    .ref()
    .update(updates);
};

const toggleVideoPublish = (sessionIDFirebase, memberID, enable) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/publishVideo`
  ] = enable;
  database()
    .ref()
    .update(updates);
};

const updateTimestamp = (sessionIDFirebase, memberID, timestamp) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/startTimestamp`
  ] = timestamp;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/stopTimestamp`
  ] = null;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/dispatched`
  ] = false;

  database()
    .ref()
    .update(updates);
};

const startRemoteRecording = (memberID, sessionIDFirebase, selfID) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/isRecording`
  ] = true;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/startTimestamp`
  ] = Date.now();
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/dispatched`
  ] = true;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/userIDrequesting`
  ] = selfID;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/flags`
  ] = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/uploadRequest`
  ] = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/thumbnail`
  ] = null;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/localSource`
  ] = null;

  database()
    .ref()
    .update(updates);
};

const stopRemoteRecording = async (
  memberID,
  sessionIDFirebase,
  portrait,
  userID,
) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/isRecording`
  ] = false;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/stopTimestamp`
  ] = Date.now();
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/enabled`
  ] = false;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/portrait`
  ] = portrait;
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/recording/userIDrequesting`
  ] = userID;
  await database()
    .ref()
    .update(updates);
  return true;
};

const getMember = (session, userID) => {
  if (!session) {
    return {};
  }
  if (!session.members) {
    return {};
  }
  return session.members[userID];
};

const getLastDrawing = (drawings) => {
  if (!drawings) {
    return false;
  }
  return Object.values(drawings)
    .sort((a, b) => a.timeStamp - b.timeStamp)
    .reverse()[0];
};

const isUserAdmin = (organizerID, userID) => {
  return userID === organizerID;
};

const isEven = (n) => {
  return !(n & 1);
};

const getVideosSharing = (session, personSharingScreen) => {
  if (!session) {
    return false;
  }
  if (!personSharingScreen) {
    return false;
  }

  const {sharedVideos} = session.members[personSharingScreen];
  if (!sharedVideos) {
    return false;
  }
  return sharedVideos;
};

// const getVideoUUID = (path) => {
//   if (!path) return 'simulator';
//   const videoUUID = path
//     ? path.split('/')[path.split('/').length - 1].split('.')[0]
//     : generateID();
//   return videoUUID;
// };

const compressThumbnail = async (initialPath) => {
  const {path} = await ImageResizer.createResizedImage(
    initialPath,
    300,
    300,
    'JPEG',
    80,
  );
  return path;
};

const generateFlagsThumbnail = async (
  flags,
  source,
  coachSessionID,
  memberID,
) => {
  // creates thumbnails for full video and flags, sets up clip selection for user who stopped recording
  let thumbnails =
    !flags || Object.keys(flags).length === 0
      ? []
      : await Promise.all(
          Object.values(flags).map(async (flag) => {
            const {id, time} = flag;
            let {path: thumbnail} = await createThumbnail({
              url: source,
              timeStamp: time,
            });
            thumbnail = await compressThumbnail(thumbnail);
            return {
              type: 'image',
              url: thumbnail,
              storageDestination: `coachSessions/${coachSessionID}/members/${memberID}/recording/flags/${id}`,
              displayInList: false,
              progress: 0,
              date: Date.now(),
            };
          }),
        );
  let {path: thumbnailFullVideo} = await createThumbnail({
    url: source,
    timeStamp: 0,
  });
  thumbnailFullVideo = await compressThumbnail(thumbnailFullVideo);
  thumbnails.push({
    type: 'image',
    url: thumbnailFullVideo,
    storageDestination: `coachSessions/${coachSessionID}/members/${memberID}/recording/fullVideo`,
    displayInList: false,
    progress: 0,
    date: Date.now(),
  });
  database()
    .ref()
    .update({
      [`coachSessions/${coachSessionID}/members/${memberID}/recording/localSource`]: source,
    });
  return thumbnails;
};

const openSession = async (user, members) => {
  const allSessions = store.getState().coachSessions;

  let allMembers = Object.values(members).map((member) => member.id);
  allMembers.push(user.id);

  let session = Object.values(allSessions)
    .filter((session) => session.members)
    .filter((session) =>
      isEqual(Object.keys(session.members).sort(), allMembers.sort()),
    );

  if (session.length !== 0) {
    return session[0];
  }
  session = await createCoachSession(user, members);
  return session;
};

const isSessionFree = (session) => {
  const coach = infoCoach(session.members);
  if (!coach) {
    return true;
  }
  return !coach.chargeForSession;
};

const infoCoach = (members) => {
  if (!members) {
    return false;
  }
  const userID = store.getState().user.userID;
  const coaches = Object.values(members).filter(
    (member) =>
      member.id !== userID && member?.info?.coach && member.isConnected,
  );
  if (coaches.length !== 0) {
    return coaches[0];
  }
  return false;
};
const closeSession = async ({noNavigation}) => {
  await store.dispatch(endCurrentSession());
  store.dispatch(unsetCurrentSession());

  if (!noNavigation) {
    store.dispatch(setLayout({isFooterVisible: true}));
    StatusBar.setBarStyle('dark-content', true);
    await navigate('Stream', {screen: 'StreamPage', params: {}});
  }
};
const openMemberAcceptCharge = async (
  session,
  forceCloseSession,
  alternateAcceptCharge,
) => {
  const userID = store.getState().user.userID;
  const tokenCusStripe = store.getState().user.infoUser.wallet.tokenCusStripe;
  const defaultCard = store.getState().user.infoUser.wallet.defaultCard;
  const {objectID} = session;
  let coach = {};
  if (session.isCoach) {
    coach = session;
  } else {
    coach = infoCoach(session.members);
  }

  const {hourlyRate, currencyRate, firstname} = coach.info;
  const setAcceptCharge = async (val) => {
    let updates = {};
    updates[`coachSessions/${objectID}/members/${userID}/acceptCharge`] = val;
    updates[`coachSessions/${objectID}/members/${userID}/payment`] = {
      tokenStripe: tokenCusStripe,
      cardID: defaultCard.id,
    };
    await database()
      .ref()
      .update(updates);

    finalizeOpening(session);
  };
  if (forceCloseSession) {
    await closeSession();
  }
  navigate('Alert', {
    textButton: 'Allow',
    title: 'This session requires a payment.',
    subtitle: `Your coach's hourly rate is ${currencyRate}$${hourlyRate}. You will be charged $${(
      hourlyRate / 60
    ).toFixed(
      1,
    )} for every minute connected with ${firstname} in a video session.`,
    displayList: true,
    disableClickOnBackdrop: true,
    close: false,
    icon: <ImageUser user={coach} />,
    componentAdded: <CardCreditCard />,
    listOptions: [
      {
        title: 'Decline',
      },
      {
        title: 'Accept',
        disabled: !defaultCard,
        button: (
          <ButtonAcceptPayment
            click={() =>
              alternateAcceptCharge
                ? alternateAcceptCharge()
                : setAcceptCharge(true)
            }
            textButton="Accept"
          />
        ),
      },
    ],
  });
};

const finalizeOpening = async (session) => {
  const currentSessionID = store.getState().coach.currentSessionID;
  const currentRouteName = getCurrentRoute();

  if (currentSessionID !== session.objectID) {
    if (currentSessionID) {
      await store.dispatch(unsetCurrentSession());
      // await timeout(100);
    }
    await store.dispatch(setCurrentSessionID(session.objectID));
  }
  await store.dispatch(setLayout({isFooterVisible: false}));

  StatusBar.setBarStyle('light-content', true);
  navigate('Session', {
    screen: 'Session',
    params: {
      coachSessionID: session.objectID,
      date: Date.now(),
      currentRouteName,
    },
  });
};

const newSession = () => {
  navigate('PickMembers', {
    usersSelected: {},
    allowSelectMultiple: true,
    selectFromGamefare: true,
    closeButton: true,
    loaderOnSubmit: true,
    displayCurrentUser: false,
    noUpdateStatusBar: true,
    noNavigation: true,
    titleHeader: 'Select members',
    text2: 'Skip',
    // icon2: 'text',
    clickButton2: () => createSession({}),
    onSelectMembers: (users, contacts) => createSession(users),
  });
};
const createSession = async (members) => {
  const {userID, infoUser} = store.getState().user;
  if (members) {
    members = Object.values(members).reduce((result, member) => {
      return {
        ...result,
        [member.id]: member,
      };
    }, {});
  }
  const {objectID} = await openSession(
    {
      id: userID,
      info: infoUser.userInfo,
    },
    members,
  );
  navigate('Conversation', {coachSessionID: objectID});
};

const sessionOpening = async (session) => {
  const currentSessionID = store.getState().coach.currentSessionID;
  if (!isSessionFree(session) && currentSessionID !== session.objectID) {
    return openMemberAcceptCharge(session);
  }
  finalizeOpening(session);
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const deleteSession = (objectID) => {
  const userID = store.getState().user.userID;

  navigate('Alert', {
    title: 'Do you want to leave this conversation?',
    textButton: 'Leave',
    colorButton: 'red',
    onPressColor: colors.redLight,
    nextNavigation: () => {
      navigate('Stream');
    },
    onGoBack: async () => {
      const currentSessionID = store.getState().coach.currentSessionID;
      let updates = {};
      updates[`users/${userID}/coachSessions/${objectID}`] = null;
      updates[`coachSessions/${objectID}/members/${userID}`] = null;
      updates[`coachSessions/${objectID}/allMembers/${userID}`] = null;
      await database()
        .ref()
        .update(updates);
      if (objectID === currentSessionID) {
        await closeSession({noNavigation: true});
      }
      return true;
    },
  });
};

const bindSession = (objectID) => {
  const isSessionBinded = store.getState().bindedSessions[objectID];
  if (!isSessionBinded) {
    database()
      .ref(`coachSessions/${objectID}`)
      .on('value', function(snapshot) {
        const coachSessionFirebase = snapshot.val();
        store.dispatch(setSession(coachSessionFirebase));
        store.dispatch(setSessionBinded({id: objectID, isBinded: true}));
      });
  }
};

const unbindSession = async (objectID) => {
  const isSessionBinded = store.getState().bindedSessions[objectID];
  if (isSessionBinded) {
    await database()
      .ref(`coachSessions/${objectID}`)
      .off();
    store.dispatch(setSessionBinded({id: objectID, isBinded: false}));
  }
};

const addMembersToSession = (objectID, navigateTo) => {
  let noUpdateStatusBar = true;
  if (navigateTo === 'Session') {
    noUpdateStatusBar = false;
  }
  navigate('PickMembers', {
    noNavigation: true,
    selectFromGamefare: true,
    allowSelectMultiple: true,
    noUpdateStatusBar: noUpdateStatusBar,
    displayCurrentUser: false,
    titleHeader: 'Add someone to the session',
    onSelectMembers: async (members, sessions) => {
      for (const member of Object.values(members)) {
        member.invitationTimeStamp = Date.now();
        await database()
          .ref('coachSessions/' + objectID + '/members/' + member.id)
          .update(member);
      }
      return goBack();
    },
  });
};

const searchSessionsForString = (search) => {
  const allSessions = store.getState().coachSessions;
  const userSessions = store.getState().user.infoUser.coachSessions;
  if (search === '') {
    return userSessions ? Object.keys(userSessions) : [];
  } else {
    const matches = Object.keys(userSessions)
      .map((id) => {
        const session = allSessions[id];
        const names = Object.values(session.members).reduce(
          (result, member) => {
            let name = '';
            if (member?.info?.firstname) {
              name = name + member.info.firstname.toLowerCase();
            }
            if (member?.info?.lastname) {
              name = name + ' ' + member.info.lastname.toLowerCase();
            }
            if (name !== '') {
              result.push(name);
            }
            return result;
          },
          [],
        );
        for (const name of names) {
          if (name.search(search.toLowerCase()) !== -1) {
            return id;
          }
          return null;
        }
      })
      .filter((x) => x);
    return matches;
  }
};

const selectVideosFromLibrary = (coachSessionID) => {
  navigate('SelectVideosFromLibrary', {
    selectableMode: true,
    selectOnly: true,
    confirmVideo: (selectedLocalVideos, selectedFirebaseVideos) =>
      shareVideosWithTeams(selectedLocalVideos, selectedFirebaseVideos, [
        coachSessionID,
      ]),
  });
};

const isVideosAreBeingShared = ({session, archives, userIDSharing}) => {
  if (!userIDSharing) {
    return false;
  }
  const videos = session.members[userIDSharing].sharedVideos;
  if (!videos) {
    return false;
  }
  const currentArchives = archives.map((archive) => archive.id).sort();
  return isEqual(Object.keys(videos).sort(), currentArchives);
};

const updateInfoVideoCloud = async ({dataUpdate, id, coachSessionID}) => {
  let updates = {};
  for (var i in dataUpdate) {
    updates[`coachSessions/${coachSessionID}/sharedVideos/${id}/${i}`] =
      dataUpdate[i];
  }
  await database()
    .ref()
    .update(updates);
  return true;
};

module.exports = {
  createCoachSession,
  timeout,
  isUserAlone,
  isSomeoneSharingScreen,
  getLastDrawing,
  userPartOfSession,
  displayTime,
  startRecording,
  stopRecording,
  getMember,
  isUserAdmin,
  isEven,
  getVideosSharing,
  startRemoteRecording,
  stopRemoteRecording,
  toggleCloudRecording,
  toggleVideoPublish,
  updateTimestamp,
  generateFlagsThumbnail,
  getVideoUUID,
  openSession,
  infoCoach,
  sessionOpening,
  openMemberAcceptCharge,
  capitalize,
  deleteSession,
  bindSession,
  unbindSession,
  newSession,
  addMembersToSession,
  searchSessionsForString,
  selectVideosFromLibrary,
  closeSession,
  isVideosAreBeingShared,
  updateInfoVideoCloud,
};
