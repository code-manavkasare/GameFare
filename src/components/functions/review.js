import {ProcessingManager} from 'react-native-video-processing';
import database from '@react-native-firebase/database';
import RNFS from 'react-native-fs';

import {getVideoInfo, getNewVideoSavePath} from '../functions/pictures';
import {generateID} from '../functions/createEvent';
import {addLocalVideo} from './videoManagement';
import {getArchiveByID} from './archive';
import {store} from '../../../reduxStore';
import {enqueueUploadTask} from '../../actions/uploadQueueActions';

const checkIfAllArchivesAreLocal = (archives) => {
  let isLocal = true;
  archives.map((archiveId) => {
    const videoInfo = getArchiveByID(archiveId);
    if (!videoInfo.local) {
      isLocal = false;
    }
  });
  return isLocal;
};

const getActionLengthReview = (recordedActions) => {
  let startTime = Infinity;
  let endTime = 0;
  for (const action of recordedActions) {
    const {timestamp} = action;
    if (timestamp) {
      startTime = Math.min(startTime, timestamp);
      endTime = Math.max(endTime, timestamp);
    }
  }
  return {startTime, endTime};
};

const cutVideo = async (source, startTime, endTime) => {
  const trimOptions = {
    startTime,
    endTime,
    saveWithCurrentDate: true,
  };
  // newSource is in {appDir}/Documents/output/filename.mp4 per ProcessingManager implementation
  const newSource = await ProcessingManager.trim(source, trimOptions);
  return newSource;
};

const adaptAllTimestampToNewVideoLength = (recordedActions, startTime) => {
  const newRecordedActions = recordedActions.map((action) => {
    if (action.timestamp) {
      action.timestamp = action.timestamp - startTime;
    }
    return action;
  });
  return newRecordedActions;
};

const saveAudioFileToAppData = async (audioFilePath) => {
  var newAudioFilePath = getNewVideoSavePath();
  await RNFS.copyFile(audioFilePath, newAudioFilePath);
  return newAudioFilePath;
};

const generatePreview = async (source, recordedActions, audioFilePath) => {
  const {startTime, endTime} = await getActionLengthReview(recordedActions);
  const newSource = await cutVideo(source, startTime, endTime);
  const audioRecordUrl = await saveAudioFileToAppData(audioFilePath);
  const newRecordedActions = adaptAllTimestampToNewVideoLength(
    recordedActions,
    startTime,
  );
  const newVideo = {
    ...(await getVideoInfo(newSource)),
    audioRecordUrl,
    recordedActions: newRecordedActions,
  };
  const videoId = await addLocalVideo({
    video: newVideo,
    backgroundUpload: true,
  });
  await addAudioRecordToUploadQueue(audioRecordUrl, videoId);
};

const generatePreviewCloud = async (
  userId,
  videoInfo,
  recordedActions,
  audioFilePath,
) => {
  const {startTime, endTime} = await getActionLengthReview(recordedActions);
  const newArchiveId = generateID();
  const dateNow = Date.now();
  const newRecordedActions = adaptAllTimestampToNewVideoLength(
    recordedActions,
    startTime,
  );

  let newVideoInfo = {
    cutRequest: {
      archiveIdToCut: videoInfo.id,
      startTime,
      endTime,
    },
    durationSeconds: endTime - startTime,
    id: newArchiveId,
    recordedActions: newRecordedActions,
    size: videoInfo.size,
    startTimestamp: dateNow,
  };

  if (userId) {
    newVideoInfo = {
      ...newVideoInfo,
      members: {
        [userId]: {
          id: userId,
          invitedBy: userId,
          timestamp: dateNow,
        },
      },
      sourceUser: userId,
    };
  }

  store.dispatch(
    enqueueUploadTask({
      type: 'audioRecord',
      id: generateID(),
      timeSubmitted: Date.now(),
      url: audioFilePath,
      cloudID: newArchiveId,
      storageDestination: `archivedStreams/${newArchiveId}`,
      isBackground: false,
      displayInList: false,
      afterUpload: (audioRecordUrl) => {
        let updates = {
          ...newVideoInfo,
          audioRecordUrl,
        };
        database()
          .ref(`archivedStreams/${newArchiveId}`)
          .set(updates);
      },
    }),
  );
};

const addAudioRecordToUploadQueue = (audioFilePath, archiveId) => {
  store.dispatch(
    enqueueUploadTask({
      type: 'audioRecord',
      id: generateID(),
      timeSubmitted: Date.now(),
      url: audioFilePath,
      cloudID: archiveId,
      storageDestination: `archivedStreams/${archiveId}`,
      isBackground: false,
      displayInList: false,
    }),
  );
};

export {checkIfAllArchivesAreLocal, generatePreview, generatePreviewCloud};
