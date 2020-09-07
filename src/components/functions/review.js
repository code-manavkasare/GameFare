import {ProcessingManager} from 'react-native-video-processing';
import RNFS from 'react-native-fs';

import {getVideoInfo} from '../functions/pictures.js';
import {generateID} from '../functions/createEvent.js';
import {addLocalVideo} from './videoManagement.js';

const checkIfAllArchivesAreLocal = (archives) => {
  let isLocal = true;
  archives.map((archive) => {
    if (!archive.local) {
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

const cropVideo = async (source, startTime, endTime) => {
  const trimOptions = {
    startTime,
    endTime,
    saveWithCurrentDate: true,
  };
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
  var newAudioFilePath = `${RNFS.DocumentDirectoryPath}/${generateID()}.mp4`;
  await RNFS.copyFile(audioFilePath, newAudioFilePath);
  return newAudioFilePath;
};

const generatePreview = async (source, recordedActions, audioFilePath) => {
  const {startTime, endTime} = await getActionLengthReview(recordedActions);
  const newSource = await cropVideo(source, startTime, endTime);
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

export {checkIfAllArchivesAreLocal, generatePreview};
