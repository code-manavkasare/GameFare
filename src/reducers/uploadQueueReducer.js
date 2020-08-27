import {
  ENQUEUE_FILE_UPLOAD,
  ENQUEUE_FILES_UPLOAD,
  DEQUEUE_FILE_UPLOAD,
  SET_UPLOAD_STATUS,
  SET_UPLOAD_INDEX,
  SET_JOB_PROGRESS,
  RESET_UPLOAD_QUEUE,
} from '../actions/types';

import {dissoc} from 'ramda';

const initialState = {
  queue: [],
  pool: {},
  status: 'empty', // STATES = ['empty', 'uploading', 'paused']
  totalProgress: 0,
  numberConcurrentUploads: 0,
};

const uploadQueueReducer = (state = initialState, action) => {
  switch (action.type) {
    case ENQUEUE_FILE_UPLOAD:
      return {
        ...state,
        pool: {
          ...state.pool,
          [action.uploadTask.id]: action.uploadTask,
        },
        status: 'uploading',
        numberConcurrentUploads: state.numberConcurrentUploads + 1,
      };
    case ENQUEUE_FILES_UPLOAD:
      const newPoolData = action.uploadTasks.reduce((data, task) => {
        return {...data, [task.id]: {...task, progress: 0}};
      }, {});
      return {
        ...state,
        pool: {
          ...newPoolData,
          ...state.pool,
        },
        status: 'uploading',
        numberConcurrentUploads:
          state.numberConcurrentUploads + action.uploadTasks.length,
      };
    case DEQUEUE_FILE_UPLOAD:
      // do NOT decrease numberConcurrentUploads here
      const {numberConcurrentUploads, pool} = state;
      const smallerPool = dissoc(action.id, pool);
      const numberRemainingUploads = Object.values(smallerPool).length;
      return {
        ...state,
        pool: smallerPool,
        totalProgress:
          (1 / numberConcurrentUploads) *
          (numberConcurrentUploads - numberRemainingUploads),
      };
    case SET_UPLOAD_STATUS:
      return {
        ...state,
        status: action.status,
      };
    case SET_JOB_PROGRESS:
      if (state.pool[action.id]) {
        return {
          ...state,
          pool: {
            ...state.pool,
            [action.id]: {
              ...state.pool[action.id],
              progress: action.progress,
            },
          },
        };
      } else {
        return state;
      }
    case RESET_UPLOAD_QUEUE:
      return initialState;
    default:
      return state;
  }
};

export default uploadQueueReducer;
