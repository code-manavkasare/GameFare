import {
  ADD_VIDEOS_LOCAL_LIBRARY,
  DELETE_VIDEO_LOCAL_LIBRARY,
  DELETE_SNIPPET_LOCAL_LIBRARY,
  HIDE_VIDEO_LOCAL_LIBRARY,
  UPDATE_PATH_LOCAL_LIBRARY,
  UPDATE_THUMBNAIL_LOCAL_LIBRARY,
} from '../actions/types';

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
    case DELETE_VIDEO_LOCAL_LIBRARY:
      let currentLibrary = state.videoLibrary;
      currentLibrary = Object.values(currentLibrary)
        .filter((video) => video.id && video.id !== action.videoID)
        .reduce(function(result, item) {
          result[item.id] = item;
          return result;
        }, {});
      return {...state, videoLibrary: currentLibrary};
    case DELETE_SNIPPET_LOCAL_LIBRARY:
      let currentSnippets = state.videoLibrary[action.parent].snippets;
      currentSnippets = Object.values(currentSnippets)
        .filter((snippet) => snippet.id !== action.id)
        .reduce((result, item) => {
          result[item.id] = item;
          return result;
        }, {});
      return {
        ...state,
        videoLibrary: {
          ...state.videoLibrary,
          [action.parent]: {
            ...state.videoLibrary[action.parent],
            snippets: currentSnippets,
          }
        }
      }
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
      const video = state.videoLibrary[action.videoID];
      return {
        ...state,
        videoLibrary: {
          ...state.videoLibrary,
          [action.videoID]: {
            ...video,
            url: action.url,
          },
        },
      };
    }
    case UPDATE_THUMBNAIL_LOCAL_LIBRARY: {
      const video = state.videoLibrary[action.videoID];
      return {
        ...state,
        videoLibrary: {
          ...state.videoLibrary,
          [action.videoID]: {
            ...video,
            thumbnail: action.thumbnail,
          },
        },
      };
    }
    default:
      return state;
  }
};

export default localVideoLibraryReducer;
