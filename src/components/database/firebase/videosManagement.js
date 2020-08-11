import database from '@react-native-firebase/database';

import {store} from '../../../../reduxStore';
import {deleteArchive, setArchive} from '../../../actions/archivesActions';

const shareCloudVideo = async (shareWithID, videoID) => {
  const {userID} = store.getState().user;
  const date = Date.now();
  await database()
    .ref()
    .update({
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
    });
};

const deleteCloudVideo = async (videoID) => {
  // removes cloud video from this user's library and removes the reference from the store
  const {userID} = store.getState().user;
  store.dispatch(deleteArchive(videoID));
  database()
    .ref()
    .update({
      [`users/${userID}/archivedStreams/${videoID}`]: null,
      [`archivedStreams/${videoID}/members/${userID}`]: null,
    });
};

const createCloudVideo = async (videoInfo) => {
  // creates a firebase object for cloud video and adds to this user's library
  const {userID} = store.getState().user;
  const archiveRef = await database()
    .ref('archivedStreams')
    .push();
  const {key} = archiveRef;
  let firebaseVideoInfo = {
    ...videoInfo,
    id: key,
    local: false,
    url: '',
    thumbnail: '',
    uploadedByUser: true,
    sourceUser: userID,
    members: [userID],
  };
  database()
    .ref()
    .update({
      [`archivedStreams/${key}`]: firebaseVideoInfo,
      [`users/${userID}/archivedStreams/${key}`]: {
        id: key,
        startTimestamp: firebaseVideoInfo.startTimestamp,
        uploadedByUser: true,
      },
    });
  store.dispatch(setArchive(firebaseVideoInfo));
  // store.dispatch(setArchiveBinded({id: firebaseVideoInfo.id, isBinded: true}));
  return firebaseVideoInfo;
};

const setCloudThumbnail = async (cloudVideoID, thumbnail) => {
  database()
    .ref()
    .update({
      [`archivedStreams/${cloudVideoID}/thumbnail`]: thumbnail,
    });
};

const updateUploadProgress = async (
  cloudVideoID,
  subscribedToProgress,
  progress,
) => {
  if (subscribedToProgress?.length > 0) {
    const updates = subscribedToProgress.reduce((result, memberID) => {
      return {
        ...result,
        [`users/${memberID}/archivedStreams/uploading/${cloudVideoID}/progress`]: progress,
      };
    }, {});
    await database()
      .ref()
      .update(updates);
  }
};

const subscribeUploadProgress = async (memberID, videoID) => {
  await database()
    .ref()
    .update({
      [`users/${memberID}/archivedStreams/uploading/${videoID}`]: {
        filename: videoID,
        hostUser: userID,
        thumbnail,
        durationSeconds,
        date: now,
        progress: 0,
        index,
      },
    });
};

const unsubscribeUploadProgress = async (memberID, videoID) => {
  await database()
    .ref()
    .update({
      [`users/${memberID}/archivedStreams/uploading/${videoID}`]: null,
    });
};

export {
  shareCloudVideo,
  deleteCloudVideo,
  createCloudVideo,
  setCloudThumbnail,
  subscribeUploadProgress,
  updateUploadProgress,
  unsubscribeUploadProgress,
};
