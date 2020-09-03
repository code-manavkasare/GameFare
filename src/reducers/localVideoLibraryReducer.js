import {
  ADD_VIDEOS_LOCAL_LIBRARY,
  REMOVE_VIDEO_LOCAL_LIBRARY,
  HIDE_VIDEO_LOCAL_LIBRARY,
  UPDATE_PATH_LOCAL_LIBRARY,
  UPDATE_THUMBNAIL_LOCAL_LIBRARY,
  UPDATE_PROGRESS_LOCAL_VIDEO,
} from '../actions/types';

import {dissoc} from 'ramda';

const initialState = {
  videoLibrary: {},
};

const localVideoLibraryReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_VIDEOS_LOCAL_LIBRARY:
      return {
        ...state,
        videoLibrary: {
          ...state.videoLibrary,
          ...action.videos,
        },
      };
    case REMOVE_VIDEO_LOCAL_LIBRARY:
      return {
        videoLibrary: dissoc(action.videoID, state.videoLibrary),
      };
    case HIDE_VIDEO_LOCAL_LIBRARY: {
      const video = state.videoLibrary[action.videoID];
      return {
        ...state,
        videoLibrary: {
          ...state.videoLibrary,
          [action.videoID]: {
            ...video,
            hidden: true,
          },
        },
      };
    }
    case UPDATE_PATH_LOCAL_LIBRARY: {
      if (state.videoLibrary[action.videoID]) {
        return {
          ...state,
          videoLibrary: {
            ...state.videoLibrary,
            [action.videoID]: {
              ...state.videoLibrary[action.videoID],
              url: action.url,
            },
          },
        };
      } else {
        return {};
      }
    }
    case UPDATE_THUMBNAIL_LOCAL_LIBRARY:
      if (state.videoLibrary[action.videoID]) {
        return {
          ...state,
          videoLibrary: {
            ...state.videoLibrary,
            [action.videoID]: {
              ...state.videoLibrary[action.videoID],
              thumbnail: action.thumbnail,
            },
          },
        };
      } else {
        return {};
      }
    case UPDATE_PROGRESS_LOCAL_VIDEO:
      if (state.videoLibrary[action.videoID]) {
        return {
          ...state,
          videoLibrary: {
            ...state.videoLibrary,
            [action.videoID]: {
              ...state.videoLibrary[action.videoID],
              progress: action.progress,
            },
          },
        };
      } else {
        return {};
      }
    default:
      return state;
  }
};

export default localVideoLibraryReducer;
