import {SET_INITIAL_INTERACTION} from '../types';

const initialState = {
  requiredInteractions: [
    'clubSearch',
    'bookService',
    'sessionTab',
    'videoLibrary',
    'CallsTab',
    'liveVideos',
  ],
};

const intialInteractionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_INITIAL_INTERACTION:
      return {
        ...state,
        ...action.value,
      };
    default:
      return state;
  }
};

export default intialInteractionReducer;
