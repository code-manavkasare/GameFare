import React from 'react';
import {StatusBar} from 'react-native';
import database from '@react-native-firebase/database';
import ImageResizer from 'react-native-image-resizer';
import isEqual from 'lodash.isequal';

import colors from '../style/colors';

import {getValueOnce} from '../database/firebase/methods';
import {generateID} from './utility.js';
import {getVideoUUID, generateThumbnail} from './pictures';
import {minutes, seconds, milliSeconds} from './date';
import {userObject} from './users';

import {store} from '../../store/reduxStore';
import {
  setCurrentSessionID,
  endCurrentSession,
  unsetCurrentSession,
} from '../../store/actions/coachActions';
import {shareVideosWithTeams} from './videoManagement';
import {setSession} from '../../store/actions/coachSessionsActions';
import {setLayout} from '../../store/actions/layoutActions';
import {enqueueUploadTasks} from '../../store/actions/uploadQueueActions';
import {setArchive} from '../../store/actions/archivesActions';
import {dateSession} from '../../components/app/TeamPage/components/elements';
import {logMixpanel} from './logs';
import {navigate} from '../../../NavigationService';

import CardCreditCard from '../app/elementsUser/elementsPayment/CardCreditCard';
import ImageUser from '../layout/image/ImageUser';
import ButtonAcceptPayment from '../layout/buttons/ButtonAcceptPayment';

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const createCoachSessionFromUserIDs = async (
  organizerID,
  otherIDs,
  sessionID = null,
) => {
  const otherInfos = await Promise.all(
    otherIDs.map((id) => getValueOnce(`users/${id}/userInfo`)),
  );
  const membersParam = otherInfos.reduce((members, info, i) => {
    if (info) {
      return {
        ...members,
        [otherIDs[i]]: {
          id: otherIDs[i],
          info,
          isConnected: false,
          permissionOtherUserToRecord: true,
        },
      };
    } else {
      return members;
    }
  }, {});
  const organizerInfo = await getValueOnce(`users/${organizerID}/userInfo`);
  if (organizerInfo) {
    return await createCoachSession(
      {id: organizerID, info: organizerInfo},
      membersParam,
      sessionID,
    );
  }
};

const createCoachSession = async (user, members, sessionID = null) => {
  const coachSessionID = sessionID ?? generateID();
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
      [user.id]: {
        ...user,
        isConnected: false,
        permissionOtherUserToRecord: true,
      },
      ...members,
    },
    allMembers: {[user.id]: true, ...allMembers},
  };
  await database()
    .ref(`coachSessions/${coachSessionID}`)
    .update(session);
  await store.dispatch(setSession(session));
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
    return false;
  }
  if (!session.members) {
    return false;
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

const setupOpentokStopRecordingFlow = async (
  sourceVideoInfo,
  flags,
  coachSessionID,
  memberID,
) => {
  let {path: thumbnail} = await generateThumbnail(sourceVideoInfo.url);
  let thumbnailUploadTasks = [
    {
      type: 'image',
      id: generateID(),
      timeSubmittted: Date.now(),
      url: thumbnail,
      cloudID: coachSessionID,
      storageDestination: `coachSessions/${coachSessionID}/members/${memberID}/recording/fullVideo`,
      skipAfterUpload: true,
      isBackground: false,
      displayInList: false,
    },
  ];
  if (flags) {
    await Promise.all(
      Object.values(flags).map(async (flag) => {
        const {id, time} = flag;
        let {path: thumbnail} = await generateThumbnail(
          sourceVideoInfo.url,
          time,
        );
        thumbnailUploadTasks.push({
          type: 'image',
          id: generateID(),
          timeSubmitted: Date.now(),
          url: thumbnail,
          cloudID: coachSessionID,
          storageDestination: `coachSessions/${coachSessionID}/members/${memberID}/recording/flags/${id}`,
          skipAfterUpload: true,
          isBackground: false,
          displayInList: false,
        });
      }),
    );
  }
  store.dispatch(enqueueUploadTasks(thumbnailUploadTasks));
  store.dispatch(setArchive({...sourceVideoInfo, local: true}));
  database()
    .ref()
    .update({
      [`coachSessions/${coachSessionID}/members/${memberID}/recording/fullVideo/id`]: sourceVideoInfo.id,
    });
  return thumbnailUploadTasks;
};

const getSortedSessions = (options) => {
  let {coachSessions, sortBy, exclude} = options;
  if (!coachSessions) {
    return [];
  }
  return Object.values(coachSessions)
    .filter((s) => {
      return s?.id !== undefined;
    })
    .sort(function(a, b) {
      const getTimestamp = ({id, timestamp}) => {
        const session = store.getState().coachSessions[id];
        const messages = store.getState().conversations[id];
        if (!session?.members || sortBy === 'lastConnection') return timestamp;
        return dateSession({session, messages, component: false});
      };
      const timestampA = getTimestamp(a) ?? a.timestamp;
      const timestampB = getTimestamp(b) ?? b.timestamp;
      return timestampB - timestampA;
    })
    .filter((s) => {
      return exclude ? exclude.indexOf(s?.id) === -1 : true;
    });
};

const openSession = async (user, members) => {
  const allSessions = store.getState().coachSessions;
  let allMembers = Object.values(members).map((member) => member.id);
  allMembers.push(user.id);
  let session = Object.values(allSessions)
    .filter((session) => session.members)
    .filter((session) => {
      return isEqual(Object.keys(session.members).sort(), allMembers.sort());
    });
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
  logMixpanel({
    label: 'Close session ',
    params: {coachSessionID: store.getState().coach.currentSessionID},
  });
  if (!noNavigation) {
    store.dispatch(setLayout({isFooterVisible: true}));
    StatusBar.setBarStyle('dark-content', true);
    await navigate('Stream', {screen: 'GroupsPage', params: {}});
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
  if (currentSessionID !== session.objectID) {
    if (currentSessionID) {
      await store.dispatch(unsetCurrentSession());
    }
    return store.dispatch(setCurrentSessionID(session.objectID));
  }
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
  return await openSession(
    {
      id: userID,
      info: infoUser.userInfo,
    },
    members,
  );
};

const sessionOpening = async (session) => {
  /* Re-enable for payment support
  const currentSessionID = store.getState().coach.currentSessionID;
  if (!isSessionFree(session) && currentSessionID !== session.objectID) {
      return openMemberAcceptCharge(session);
  }
  */
  logMixpanel({
    label: 'Open session ' + session.objectID,
    params: {coachSessionID: session.objectID},
  });

  await navigate('Session');
  return finalizeOpening(session);
  /*
    Set timeout is a quick fix, unset/set current
    session ID forces session component to update
    before navigation blocking the UI thread.
  */
  // setTimeout(async () => {
  // }, 200);
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
      navigate('CallTab');
    },
    onGoBack: async () => {
      const currentSessionID = store.getState().coach.currentSessionID;
      logMixpanel({
        label: 'Leave session ' + currentSessionID,
        params: {coachSessionID: currentSessionID},
      });
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

const loadAndOpenSession = async (sessionID) => {
  const coachSession = await database()
    .ref(`coachSessions/${sessionID}`)
    .once('value');
  const coachSessionFirebase = coachSession.val();
  if (coachSessionFirebase) {
    await store.dispatch(setSession(coachSessionFirebase));
    sessionOpening(coachSessionFirebase);
  }
};

const addMembersToSession = async (coachSessionID, members) => {
  const userID = store.getState().user.userID;
  if (members && Object.keys(members).length > 0) {
    const invitationTimeStamp = Date.now();
    const firebaseUpdates = Object.values(members).reduce((updates, member) => {
      return {
        ...updates,
        [`coachSessions/${coachSessionID}/members/${member.id}`]: {
          ...member,
          invitationTimeStamp,
          invitedBy: userID,
          permissionOtherUserToRecord: true,
        },
      };
    }, {});
    await database()
      .ref()
      .update(firebaseUpdates);
  }
};

const addMembersToSessionByID = async (coachSessionID, memberIDs) => {
  const infos = await Promise.all(
    memberIDs.map((id) => getValueOnce(`users/${id}/userInfo`)),
  );
  const members = infos.reduce((members, info, i) => {
    if (info) {
      const id = memberIDs[i];
      const member = userObject(info, memberIDs[i]);
      return {
        ...members,
        [id]: {
          ...member,
          isConnected: false,
          permissionOtherUserToRecord: true,
        },
      };
    } else {
      return members;
    }
  }, {});
  addMembersToSession(coachSessionID, members);
};

const searchSessionsForString = (search) => {
  const allSessions = store.getState().coachSessions;
  const userSessions = store.getState().user.infoUser.coachSessions;
  if (search === '') {
    return userSessions ? Object.keys(userSessions) : [];
  } else if (userSessions) {
    const matches = Object.keys(userSessions)
      .map((id) => {
        const session = allSessions[id];
        if (!session?.members) {
          return null;
        }
        const names = Object.values(session?.members).reduce(
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
  return [];
};

const selectVideosFromLibrary = (coachSessionID) => {
  navigate('SelectVideosFromLibrary', {
    selectableMode: true,
    selectOnly: true,
    navigateBackAfterConfirm: true,
    confirmVideo: async (selectedVideos) => {
      await shareVideosWithTeams(selectedVideos, [coachSessionID]);
    },
  });
};

const isVideosAreBeingShared = ({session, archives, userIDSharing}) => {
  if (!userIDSharing || !session) {
    return false;
  }
  const videos = session.members[userIDSharing].sharedVideos;
  if (!videos) {
    return false;
  }
  const currentArchives = Object.values(archives)
    .map((archive) => (archive.id ? archive.id : archive))
    .sort();
  const newVideosAdded = currentArchives.every((videoID) =>
    Object.keys(videos).includes(videoID),
  );
  if (newVideosAdded) {
    return true;
  }
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

export {
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
  setupOpentokStopRecordingFlow,
  getVideoUUID,
  openSession,
  infoCoach,
  sessionOpening,
  openMemberAcceptCharge,
  capitalize,
  deleteSession,
  getSortedSessions,
  createSession,
  createCoachSessionFromUserIDs,
  addMembersToSession,
  addMembersToSessionByID,
  searchSessionsForString,
  selectVideosFromLibrary,
  closeSession,
  isVideosAreBeingShared,
  updateInfoVideoCloud,
  loadAndOpenSession,
};
