import React, {Component} from 'react';

import database from '@react-native-firebase/database';
import {createThumbnail} from 'react-native-create-thumbnail';
import ImageResizer from 'react-native-image-resizer';
import axios from 'axios';
import Config from 'react-native-config';
import StatusBar from '@react-native-community/status-bar';
import isEqual from 'lodash.isequal';

import {generateID} from './createEvent';
import {store} from '../../../reduxStore';
import {
  setCurrentSession,
  endCurrentSession,
  unsetCurrentSession,
} from '../../actions/coachActions';
import {setLayout} from '../../actions/layoutActions';
import {navigate} from '../../../NavigationService';

import CardCreditCard from '../app/elementsUser/elementsPayment/CardCreditCard';
import ImageUser from '../layout/image/ImageUser';
import ButtonAcceptPayment from '../layout/buttons/ButtonAcceptPayment';

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
    members: {
      [user.id]: {...user, isConnected: false},
      ...members,
    },
    allMembers: {[user.id]: true, ...allMembers},
  };
  await database()
    .ref(`coachSessions/${coachSessionID}`)
    .update(session);
  return session;
};

const isUserAlone = (session) => {
  if (!session) return null;
  if (!session.members) return true;
  return (
    Object.values(session.members).filter((member) => member.isConnected)
      .length <= 1
  );
};

const isSomeoneSharingScreen = (session) => {
  if (!session) return false;
  if (!session.members) return false;
  if (
    Object.values(session.members).filter(
      (member) => member.isConnected && member.shareScreen,
    ).length > 0
  )
    return Object.values(session.members).filter(
      (member) => member.isConnected && member.shareScreen,
    )[0].id;
  return false;
};

const userPartOfSession = (session, userID) => {
  if (!session) return false;
  if (!session.allMembers) return false;
  if (!session.allMembers[userID]) return false;
  return session.members[userID];
};

const minutes = (time) => {
  return Math.floor(time / 60);
};

const seconds = (time, displayMilliseconds) => {
  let sec = (time % 60).toFixed(0);
  if (displayMilliseconds) sec = Math.floor(time % 60).toFixed(0);
  // if (sec.length === 1 && Number(sec) !== 0) return '0 ' + sec;
  return sec;
};

const milliSeconds = (time) => {
  const min = minutes(time) * 60;
  const sec = Math.floor(time % 60);
  let ms = Number(((time - (min + sec)) * 100).toFixed(0));

  if (ms.toString().length === 1) return '0' + ms;
  if (ms === 100) return '00';
  if (ms === 0) return '00';
  return ms;
};

const displayTime = (time, displayMilliseconds) => {
  function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }
  if (displayMilliseconds)
    return (
      pad(minutes(time), 2) +
      ':' +
      pad(seconds(time, displayMilliseconds), 2) +
      ':' +
      pad(milliSeconds(time), 2)
    );

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

toggleVideoPublish = (sessionIDFirebase, memberID, enable) => {
  let updates = {};
  updates[
    `coachSessions/${sessionIDFirebase}/members/${memberID}/publishVideo`
  ] = enable;
  database()
    .ref()
    .update(updates);
}

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

  database()
    .ref()
    .update(updates);
};

const stopRemoteRecording = async (memberID, sessionIDFirebase, portrait, userID) => {
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
  if (!session) return {};
  if (!session.members) return {};
  return session.members[userID];
};

const getLastDrawing = (drawings) => {
  if (!drawings) return false;
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

const getVideoSharing = (session, personSharingScreen) => {
  if (!session) return false;
  if (!personSharingScreen) return false;

  const {videoIDSharing} = session.members[personSharingScreen];
  if (!session.sharedVideos) return false;
  return session.sharedVideos[videoIDSharing];
};

const getVideoUUID = (path) => {
  if (!path) return 'simulator';
  const videoUUID = path
    ? path.split('/')[path.split('/').length - 1].split('.')[0]
    : generateID();
  return videoUUID;
};

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

const generateFlagsThumbnail = async ({
  flags,
  source,
  memberID,
  coachSessionID,
}) => {
  let thumbnails = [];
  if (flags) {
    for (var i in flags) {
      const flag = flags[i];
      const flagID = flag.id;
      let {path: thumbnail} = await createThumbnail({
        url: source,
        timeStamp: flag.time,
      });
      thumbnail = await compressThumbnail(thumbnail);

      thumbnails.push({
        path: thumbnail,
        thumbnail: thumbnail,
        localIdentifier: getVideoUUID(thumbnail),
        storageDestination: `coachSessions/${coachSessionID}/members/${memberID}/recording/flags/${flagID}/thumbnail`,
        destinationFile: `coachSessions/${coachSessionID}/members/${memberID}/recording/flags/${flagID}/thumbnail`,
        firebaseUpdates: {},
        displayInList: false,
        progress: 0,
        type: 'image',
        filename: 'Thumbnail',
        updateFirebaseAfterUpload: true,
        date: Date.now(),
      });
    }
  }
  let {path: thumbnailFullVideo} = await createThumbnail({
    url: source,
    timeStamp: 500,
  });
  thumbnailFullVideo = await compressThumbnail(thumbnailFullVideo);
  thumbnails.push({
    path: thumbnailFullVideo,
    localIdentifier: getVideoUUID(thumbnailFullVideo),
    storageDestination: `coachSessions/${coachSessionID}/members/${memberID}/recording/thumbnail`,
    destinationFile: `coachSessions/${coachSessionID}/members/${memberID}/recording/thumbnail`,
    firebaseUpdates: {},
    thumbnail: thumbnailFullVideo,
    filename: 'Thumbnail full video',
    displayInList: false,
    progress: 0,
    type: 'image',
    updateFirebaseAfterUpload: true,
    date: Date.now(),
  });
  await database()
    .ref()
    .update({
      [`coachSessions/${coachSessionID}/members/${memberID}/recording/localSource`]: source,
    });

  return thumbnails;
};

const openSession = async (user, members) => {
  const allSessions = store.getState().coach.allSessions;

  let allMembers = Object.values(members).map((member) => member.id);
  allMembers.push(user.id);

  let session = Object.values(allSessions)
    .filter((session) => session.members)
    .filter((session) =>
      isEqual(Object.keys(session.members).sort(), allMembers.sort()),
    );

  if (session.length !== 0) return session[0];
  session = await createCoachSession(user, members);
  return session;
};

const isSessionFree = (session) => {
  const coach = infoCoach(session.members);
  if (!coach) return true;
  return !coach.chargeForSession;
};

const infoCoach = (members) => {
  if (!members) return false;
  const userID = store.getState().user.userID;
  const coaches = Object.values(members).filter(
    (member) => member.id !== userID && member?.info?.coach && member.isConnected,
  );
  if (coaches.length !== 0) return coaches[0];
  return false;
};
const closeSession = async () => {
  await store.dispatch(endCurrentSession());
  await navigate('Stream');
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
  if (session.isCoach) coach = session;
  else coach = infoCoach(session.members);

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
  if (forceCloseSession) await closeSession();
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
  if (currentSessionID !== session.objectID) {
    if (currentSessionID) {
      // what to do in the case where user is in a session already and maybe recording?
      // simply unsetting the current session means recording is lost -- Ethan
      await store.dispatch(unsetCurrentSession());
      await timeout(100);
    }
    await store.dispatch(setCurrentSession(session));
  }
  await store.dispatch(setLayout({isFooterVisible: false}));

  StatusBar.setBarStyle('light-content', true);
  navigate('Session', {
    screen: 'Session',
    params: {coachSessionID: session.objectID, date: Date.now()},
  });
};

const sessionOpening = async (session) => {
  const currentSessionID = store.getState().coach.currentSessionID;
  if (!isSessionFree(session) && currentSessionID !== session.objectID)
    return openMemberAcceptCharge(session);
  finalizeOpening(session);
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
  getVideoSharing,
  startRemoteRecording,
  stopRemoteRecording,
  toggleCloudRecording,
  toggleVideoPublish,
  updateTimestamp,
  generateFlagsThumbnail,
  getVideoUUID,
  openSession,
  minutes,
  seconds,
  infoCoach,
  sessionOpening,
  openMemberAcceptCharge,
  capitalize,
};
