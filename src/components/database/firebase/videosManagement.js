import database from '@react-native-firebase/database';

import {store} from '../../../../reduxStore';
import {getOnceValue} from './methods';

const shareCloudVideo = async (
  shareWithID,
  videoID,
  forceInvitedByUser = null,
) => {
  const userID = forceInvitedByUser ?? store.getState().user.userID;
  const date = Date.now();
  let updates = {
    [`users/${shareWithID}/archivedStreams/${videoID}`]: {
      id: videoID,
      startTimestamp: date,
      uploadedByUser: false,
    },
    [`archivedStreams/${videoID}/members/${shareWithID}`]: {
      id: shareWithID,
      invitedBy: userID,
      timestamp: date,
    },
  };
  await database()
    .ref()
    .update(updates);
};

const deleteCloudVideo = async (videoID) => {
  // removes cloud video from this user's library and removes the reference from the store
  const {userID} = store.getState().user;
  database()
    .ref()
    .update({
      [`users/${userID}/archivedStreams/${videoID}`]: null,
      [`archivedStreams/${videoID}/members/${userID}`]: null,
    });
};

const deleteCloudVideos = async (videoIDs) => {
  const {userID} = store.getState().user;
  let updates = {};
  videoIDs.map((videoID) => {
    updates[`users/${userID}/archivedStreams/${videoID}`] = null;
    updates[`archivedStreams/${videoID}/members/${userID}`] = null;
  });
  database()
    .ref()
    .update(updates);
};

const deleteCloudVideoInfo = (id) => {
  database()
    .ref(`archivedStreams/${id}`)
    .remove();
};

const mergeInfoWithExistingCloudVideo = async (firebaseVideoInfo) => {
  const cloudVideoInfo = await getOnceValue(
    `archivedStreams/${firebaseVideoInfo.id}`,
  );
  return {...firebaseVideoInfo, ...cloudVideoInfo};
};

const createCloudVideo = async (videoInfo) => {
  // creates a firebase object for cloud video
  if (videoInfo.id) {
    const {userID} = store.getState().user;
    let firebaseVideoInfo = {
      ...videoInfo,
      local: false,
      fromNativeLibrary: false,
      uploadedByUser: true,
      url: false,
      sourceUser: userID,
    };
    const newFirebaseVideoInfo = await mergeInfoWithExistingCloudVideo(
      firebaseVideoInfo,
    );
    await database()
      .ref(`archivedStreams/${videoInfo.id}`)
      .set(newFirebaseVideoInfo);
    return true;
  } else {
    return false;
  }
};

const claimCloudVideo = async (videoInfo) => {
  // sets source user and adds video to this user's library
  const {userID} = store.getState().user;
  await database()
    .ref()
    .update({
      [`archivedStreams/${videoInfo.id}/sourceUser`]: userID,
      [`archivedStreams/${videoInfo.id}/progress`]: null,
      [`archivedStreams/${videoInfo.id}/members/${userID}`]: {id: userID},
      [`users/${userID}/archivedStreams/${videoInfo.id}`]: {
        id: videoInfo.id,
        startTimestamp: videoInfo.startTimestamp,
      },
    });
};

const updateThumbnailCloud = async (videoInfo) => {
  const {userID} = store.getState().user;
  const updates = {
    [`archivedStreams/${videoInfo.id}/thumbnail`]: videoInfo.thumbnail,
    [`archivedStreams/${videoInfo.id}/members/${userID}`]: {id: userID},
    [`users/${userID}/archivedStreams/${videoInfo.id}`]: {
      id: videoInfo.id,
      startTimestamp: videoInfo.startTimestamp,
    },
  };
  await database()
    .ref()
    .update(updates);
};

const setCloudVideoThumbnail = async (cloudVideoID, thumbnail) => {
  database()
    .ref()
    .update({
      [`archivedStreams/${cloudVideoID}/thumbnail`]: thumbnail,
    });
};

const updateCloudUploadProgress = async (cloudVideoID, progress) => {
  const isBinded = store.getState().bindedArchives[cloudVideoID];
  const archive = store.getState().archives[cloudVideoID];
  if (isBinded) {
    if (archive && archive.progress) {
      if (
        progress === null ||
        progress === 1 ||
        progress > archive.progress + 0.2
      ) {
        database()
          .ref(`archivedStreams/${cloudVideoID}/progress`)
          .set(progress);
      }
    } else if (archive) {
      database()
        .ref(`archivedStreams/${cloudVideoID}/progress`)
        .set(progress);
    }
  }
};

const shareCloudVideoWithCoachSession = async (
  cloudVideoID,
  coachSessionID,
  sharingScreenID,
) => {
  console.log('shareCloudVideoWithCoachSession', {
    cloudVideoID,
    coachSessionID,
    sharingScreenID,
  });
  database()
    .ref()
    .update({
      [`coachSessions/${coachSessionID}/sharedVideos/${cloudVideoID}/currentTime`]: 0,
      [`coachSessions/${coachSessionID}/sharedVideos/${cloudVideoID}/paused`]: true,
      [`coachSessions/${coachSessionID}/sharedVideos/${cloudVideoID}/playRate`]: 1,
      [`coachSessions/${coachSessionID}/sharedVideos/${cloudVideoID}/id`]: cloudVideoID,
      [`coachSessions/${coachSessionID}/members/${sharingScreenID}/shareScreen`]: true,
      [`coachSessions/${coachSessionID}/members/${sharingScreenID}/videoIDSharing`]: cloudVideoID,
      [`coachSessions/${coachSessionID}/members/${sharingScreenID}/sharedVideos/${cloudVideoID}`]: true,
    });
};

export {
  shareCloudVideo,
  deleteCloudVideo,
  deleteCloudVideos,
  deleteCloudVideoInfo,
  createCloudVideo,
  claimCloudVideo,
  setCloudVideoThumbnail,
  updateCloudUploadProgress,
  shareCloudVideoWithCoachSession,
  updateThumbnailCloud,
};
