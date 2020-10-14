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
  MODIFY_UPLOAD_TASK,
} from '../actions/types';

import {dissoc} from 'ramda';

const initialState = {
  queue: {},
  totalProgress: 0,
  numberConcurrentUploads: 0,
  completedTasks: 0,
};

const prepTask = (task) => {
  return {
    ...task,
    started: false,
    paused: false,
    finished: false,
    error: false,
  };
};

const uploadQueueReducer = (state = initialState, action) => {
  switch (action.type) {
    case ENQUEUE_UPLOAD_TASK:
      return {
        ...state,
        queue: {
          ...state.queue,
          [action.uploadTask.id]: prepTask(action.uploadTask),
        },
        numberConcurrentUploads: action.uploadTask?.displayInList
          ? state.numberConcurrentUploads + 1
          : state.numberConcurrentUploads,
      };
    case ENQUEUE_UPLOAD_TASKS:
      const newPoolData = action.uploadTasks.reduce((data, task) => {
        return {
          ...data,
          [task.id]: prepTask(task),
        };
      }, {});
      const listedTaskLength = action.uploadTasks.reduce((data = 0, task) => {
        return task.displayInList ? data + 1 : data;
      });
      return {
        ...state,
        queue: {
          ...newPoolData,
          ...state.queue,
        },
        numberConcurrentUploads:
          state.numberConcurrentUploads + listedTaskLength,
      };
    case DEQUEUE_UPLOAD_TASK:
      // do NOT decrease numberConcurrentUploads here
      const {numberConcurrentUploads, queue, completedTasks} = state;
      const smallerQueue = dissoc(action.id, queue);
      const numberRemainingUploads = Object.values(smallerQueue).length;
      const {displayInList} = queue[`${action.id}`];
      let nextState = {
        ...state,
        queue: smallerQueue,
      };
      if (numberRemainingUploads === 0) {
        nextState = {
          ...nextState,
          numberConcurrentUploads: 0,
          completedTasks: 0,
          totalProgress: 0,
        };
      } else if (displayInList) {
        const totalProgress =
          (1 / numberConcurrentUploads) *
          (numberConcurrentUploads - numberRemainingUploads);
        nextState = {
          ...nextState,
          completedTasks: completedTasks + 1,
        };
        if (totalProgress > 0) {
          nextState = {
            ...nextState,
            totalProgress,
          };
        }
      }
      return nextState;
    case START_UPLOAD_TASK:
      if (state.queue[action.id]) {
        return {
          ...state,
          queue: {
            ...state.queue,
            [action.id]: {
              ...state.queue[action.id],
              started: true,
            },
          },
        };
      } else {
        return state;
      }
    case PAUSE_UPLOAD_TASK:
      if (state.queue[action.id]) {
        return {
          ...state,
          queue: {
            ...state.queue,
            [action.id]: {
              ...state.queue[action.id],
              paused: true,
            },
          },
        };
      } else {
        return state;
      }

    case RESUME_UPLOAD_TASK:
      if (state.queue[action.id]) {
        return {
          ...state,
          queue: {
            ...state.queue,
            [action.id]: {
              ...state.queue[action.id],
              paused: false,
            },
          },
        };
      } else {
        return state;
      }

    case FINISH_UPLOAD_TASK:
      if (state.queue[action.id]) {
        return {
          ...state,
          queue: {
            ...state.queue,
            [action.id]: {
              ...state.queue[action.id],
              finished: true,
            },
          },
        };
      } else {
        return state;
      }

    case SET_UPLOAD_TASK_PROGRESS:
      if (state.queue[action.id]) {
        const {numberConcurrentUploads, completedTasks} = state;
        return {
          ...state,
          queue: {
            ...state.queue,
            [action.id]: {
              ...state.queue[action.id],
              progress: action.progress,
              uploading: true,
            },
          },
          totalProgress:
            (action.progress + completedTasks) * (1 / numberConcurrentUploads),
        };
      } else {
        return state;
      }
    case MODIFY_UPLOAD_TASK:
      return {
        ...state,
        queue: {
          ...state.queue,
          [action.data.id]: {
            ...state.queue[action.id],
            ...action.data,
          },
        },
      };
    case SET_UPLOAD_TASK_ERROR:
      if (state.queue[action.id]) {
        return {
          ...state,
          queue: {
            ...state.queue,
            [action.id]: {
              ...state.queue[action.id],
              error: action.error,
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
