import {
  ENQUEUE_FILE_UPLOAD,
  ENQUEUE_FILES_UPLOAD,
  DEQUEUE_FILE_UPLOAD,
  SET_UPLOAD_STATUS,
  SET_UPLOAD_INDEX,
  SET_JOB_PROGRESS,
  RESET_UPLOAD_QUEUE,
} from './types';

const enqueueFileUpload = (value) => ({
  type: ENQUEUE_FILE_UPLOAD,
  value: value,
});

const enqueueFilesUpload = (value) => ({
  type: ENQUEUE_FILES_UPLOAD,
  value: value,
});

const dequeueFileUpload = (value) => ({
  type: DEQUEUE_FILE_UPLOAD,
  index: value
})

const setUploadStatus = (value) => ({
  type: SET_UPLOAD_STATUS,
  status: value
})

const setUploadIndex = (value) => ({
  type: SET_UPLOAD_INDEX,
  index: value
})

const setJobProgress = (value) => ({
  type: SET_JOB_PROGRESS, 
  index: value.index,
  progress: value.progress
})

const resetUploadQueue = () => ({
  type: RESET_UPLOAD_QUEUE
})

export const uploadQueueAction = (val, data) => {
  // console.log('UPLOAD FILE ACTION', val, data)
  return async function(dispatch) {
    if (val === 'enqueueFileUpload') {
      await dispatch(enqueueFileUpload(data))      
    } else if (val === 'enqueueFilesUpload') {
      await dispatch(enqueueFilesUpload(data))      
    } else if (val === 'dequeueFileUpload') {
      await dispatch(dequeueFileUpload(data))
    } else if (val === 'setUploadStatus') {
      await dispatch(setUploadStatus(data))
    } else if (val === 'setUploadIndex') {
      await dispatch(setUploadIndex(data))
    } else if (val === 'setJobProgress') {
      await dispatch(setJobProgress(data))
    } else if (val === 'resetUploadQueue') {
      await dispatch(resetUploadQueue())
    }
    return true;
  };
};
