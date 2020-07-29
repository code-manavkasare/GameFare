import {
  ENQUEUE_FILE_UPLOAD,
  ENQUEUE_FILES_UPLOAD,
  DEQUEUE_FILE_UPLOAD,
  SET_UPLOAD_STATUS,
  SET_UPLOAD_INDEX,
  SET_JOB_PROGRESS,
  RESET_UPLOAD_QUEUE,
} from '../actions/types';

const initialState = {
  queue: [],
  status: 'empty', // STATES = ['empty', 'uploading', 'paused']
  index: 0,
};

const uploadQueueReducer = (state = initialState, action) => {
  switch (action.type) {
    case ENQUEUE_FILE_UPLOAD:
      console.log('ENQUEUE_FILE_UPLOAD', action.value);
      let increasedQueue = state.queue;
      increasedQueue.push(action.value);
      return {...state, queue: increasedQueue, status: 'uploading'};
    case ENQUEUE_FILES_UPLOAD:
      let appendedQueue = state.queue;
      console.log('ENQUEUE_FILES_UPLOAD', action.value);
      appendedQueue = appendedQueue.concat(action.value);
      return {...state, queue: appendedQueue, status: 'uploading'};
    case DEQUEUE_FILE_UPLOAD:
      let decreasedQueue = state.queue;
      decreasedQueue.splice(action.index, 1);
      return {
        ...state,
        queue: decreasedQueue,
        status: decreasedQueue.length < 1 ? 'empty' : state.status,
      };
    case SET_UPLOAD_STATUS:
      return {
        ...state,
        status: action.status,
      };
    case SET_UPLOAD_INDEX:
      return {
        ...state,
        index: action.index,
      };
    case SET_JOB_PROGRESS:
      let progressQueue = state.queue;
      try {
        progressQueue[action.index]['progress'] = action.progress;
      } catch {
        return state
      }
      return {
        ...state,
        queue: progressQueue,
      };
    case RESET_UPLOAD_QUEUE:
      return initialState;
    default:
      return state;
  }
};

export default uploadQueueReducer;
