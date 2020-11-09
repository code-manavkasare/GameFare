import {
  ADD_USER_LOCAL_ARCHIVE,
  REMOVE_USER_LOCAL_ARCHIVE,
  REMOVE_USER_LOCAL_ARCHIVES,
  LEGACY_REMOVE_USER_LOCAL_ARCHIVE,
} from '../types';

import {dissoc, assoc} from 'ramda';

const initialState = {
  videoLibrary: {}, // legacy, fixed by videoManagement.oneTimeFixStoreLocalVideoLibrary() called in App.js
  userLocalArchives: {},
};

const localVideoLibraryReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER_LOCAL_ARCHIVE:
      const newUserLocalArchive = {
        id: action.archiveID,
        startTimestamp: action.startTimestamp,
        backgroundUpload: action.backgroundUpload,
      };
      return {
        ...state,
        userLocalArchives: assoc(
          action.archiveID,
          newUserLocalArchive,
          state.userLocalArchives,
        ),
      };
    case REMOVE_USER_LOCAL_ARCHIVE:
      return {
        ...state,
        userLocalArchives: dissoc(action.archiveID, state.userLocalArchives),
      };
    case REMOVE_USER_LOCAL_ARCHIVES:
      const newArchives = action.archiveIDs.reduce(
        (newArchives, archiveID) => dissoc(archiveID, newArchives),
        state.userLocalArchives,
      );
      return {
        ...state,
        userLocalArchives: newArchives,
        lastDeletedArchiveIds: action.archiveIDs,
      };
    case LEGACY_REMOVE_USER_LOCAL_ARCHIVE:
      return {
        ...state,
        videoLibrary: dissoc(action.archiveID, state.videoLibrary),
      };
    default:
      return state;
  }
};

export default localVideoLibraryReducer;
