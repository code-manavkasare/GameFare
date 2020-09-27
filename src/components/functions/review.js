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
  const newSource = await ProcessingManager.trim(source, trimOptions);
  const docsSource = getNewVideoSavePath();
  await RNFS.copyFile(newSource, docsSource);
  console.log('new source', newSource);
  return docsSource;
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
  const audioUrl = await saveAudioFileToAppData(audioFilePath);
  const newRecordedActions = adaptAllTimestampToNewVideoLength(
    recordedActions,
    startTime,
  );
  const newVideo = {
    ...(await getVideoInfo(newSource)),
    audioUrl,
    recordedActions: newRecordedActions,
  };
  addLocalVideo(newVideo);
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

  const newVideoInfo = {
    cutRequest: {
      archiveIdToCut: videoInfo.id,
      startTime,
      endTime,
    },
    durationSeconds: endTime - startTime,
    id: newArchiveId,
    members: {
      [userId]: {
        id: userId,
        invitedBy: userId,
        timestamp: dateNow,
      },
    },
    recordedActions: newRecordedActions,
    size: videoInfo.size,
    sourceUser: userId,
    startTimestamp: dateNow,
  };

  store.dispatch(
    enqueueUploadTask({
      type: 'audioRecord',
      id: generateID(),
      timeSubmitted: Date.now(),
      url: audioFilePath,
      storageDestination: `archivedStreams/${newArchiveId}`,
      isBackground: true,
      displayInList: false,
    }),
  );

  database()
    .ref(`archivedStreams/${newArchiveId}`)
    .set(newVideoInfo);
};

export {checkIfAllArchivesAreLocal, generatePreview, generatePreviewCloud};
