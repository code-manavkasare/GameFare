import {
  ENQUEUE_UPLOAD_TASK,
  ENQUEUE_UPLOAD_TASKS,
  DEQUEUE_UPLOAD_TASK,
  START_UPLOAD_TASK,
  PAUSE_UPLOAD_TASK,
  RESUME_UPLOAD_TASK,
  FINISH_UPLOAD_TASK,
  SET_UPLOAD_TASK_PROGRESS,
  SET_UPLOAD_TASK_ERROR,
  RESET_UPLOAD_QUEUE,
} from './types';

export const enqueueUploadTask = (uploadTask) => ({
  type: ENQUEUE_UPLOAD_TASK,
  uploadTask,
});

export const enqueueUploadTasks = (uploadTasks) => ({
  type: ENQUEUE_UPLOAD_TASKS,
  uploadTasks,
});

export const dequeueUploadTask = (id) => ({
  type: DEQUEUE_UPLOAD_TASK,
  id,
});

export const startUploadTask = (id) => ({
  type: START_UPLOAD_TASK,
  id,
});

export const pauseUploadTask = (id) => ({
  type: PAUSE_UPLOAD_TASK,
  id,
});

export const resumeUploadTask = (id) => ({
  type: RESUME_UPLOAD_TASK,
  id,
});

export const finishUploadTask = (id) => ({
  type: FINISH_UPLOAD_TASK,
  id,
});

export const setUploadTaskProgress = (data) => ({
  type: SET_UPLOAD_TASK_PROGRESS,
  id: data.id,
  progress: data.progress,
});

export const setUploadTaskError = (data) => ({
  type: SET_UPLOAD_TASK_ERROR,
  id: data.id,
  error: data.error,
});

export const resetUploadQueue = () => ({
  type: RESET_UPLOAD_QUEUE,
});

export const uploadQueueAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'enqueueUploadTask') {
      await dispatch(enqueueUploadTask(data));
    } else if (val === 'enqueueUploadTasks') {
      await dispatch(enqueueUploadTasks(data));
    } else if (val === 'dequeueUploadTask') {
      await dispatch(dequeueUploadTask(data));
    } else if (val === 'startUploadTask') {
      await dispatch(startUploadTask(data));
    } else if (val === 'pauseUploadTask') {
      await dispatch(pauseUploadTask(data));
    } else if (val === 'resumeUploadTask') {
      await dispatch(resumeUploadTask(data));
    } else if (val === 'finishUploadTask') {
      await dispatch(finishUploadTask(data));
    } else if (val === 'setUploadTaskProgress') {
      await dispatch(setUploadTaskProgress(data));
    } else if (val === 'setUploadTaskError') {
      await dispatch(setUploadTaskError(data));
    } else if (val === 'resetUploadQueue') {
      await dispatch(resetUploadQueue());
    }
    return true;
  };
};
