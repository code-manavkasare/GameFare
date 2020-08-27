import {
  ENQUEUE_FILE_UPLOAD,
  ENQUEUE_FILES_UPLOAD,
  DEQUEUE_FILE_UPLOAD,
  SET_UPLOAD_STATUS,
  SET_UPLOAD_INDEX,
  SET_JOB_PROGRESS,
  RESET_UPLOAD_QUEUE,
} from './types';

export const enqueueFileUpload = (uploadTask) => ({
  type: ENQUEUE_FILE_UPLOAD,
  uploadTask,
});

const enqueueFilesUpload = (uploadTasks) => ({
  type: ENQUEUE_FILES_UPLOAD,
  uploadTasks,
});

const dequeueFileUpload = (id) => ({
  type: DEQUEUE_FILE_UPLOAD,
  id,
});

const setUploadStatus = (status) => ({
  type: SET_UPLOAD_STATUS,
  status,
});

const setUploadIndex = (index) => ({
  type: SET_UPLOAD_INDEX,
  index,
});

const setJobProgress = (data) => ({
  type: SET_JOB_PROGRESS,
  id: data.id,
  progress: data.progress,
});

const resetUploadQueue = () => ({
  type: RESET_UPLOAD_QUEUE,
});

export const uploadQueueAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'enqueueFileUpload') {
      await dispatch(enqueueFileUpload(data));
    } else if (val === 'enqueueFilesUpload') {
      await dispatch(enqueueFilesUpload(data));
    } else if (val === 'dequeueFileUpload') {
      await dispatch(dequeueFileUpload(data));
    } else if (val === 'setUploadStatus') {
      await dispatch(setUploadStatus(data));
    } else if (val === 'setUploadIndex') {
      await dispatch(setUploadIndex(data));
    } else if (val === 'setJobProgress') {
      await dispatch(setJobProgress(data));
    } else if (val === 'resetUploadQueue') {
      await dispatch(resetUploadQueue());
    }
    return true;
  };
};
