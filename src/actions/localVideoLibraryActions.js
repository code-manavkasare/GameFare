import {
  ADD_USER_LOCAL_ARCHIVE,
  REMOVE_USER_LOCAL_ARCHIVE,
  REMOVE_USER_LOCAL_ARCHIVES,
  LEGACY_REMOVE_USER_LOCAL_ARCHIVE,
} from './types';

export const addUserLocalArchive = (value) => ({
  type: ADD_USER_LOCAL_ARCHIVE,
  archiveID: value.archiveID,
  startTimestamp: value.startTimestamp,
  backgroundUpload: value.backgroundUpload,
});

export const removeUserLocalArchive = (archiveID) => ({
  type: REMOVE_USER_LOCAL_ARCHIVE,
  archiveID,
});

export const removeUserLocalArchives = (archiveIDs) => ({
  type: REMOVE_USER_LOCAL_ARCHIVES,
  archiveIDs,
});

export const legacyRemoveUserLocalArchive = (archiveID) => ({
  type: LEGACY_REMOVE_USER_LOCAL_ARCHIVE,
  archiveID,
});

export const localVideoLibraryAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'addUserLocalArchive') {
      await dispatch(addUserLocalArchive(data));
    } else if (val === 'removeUserLocalArchive') {
      await dispatch(removeUserLocalArchive(data));
    } else if (val === 'removeUserLocalArchives') {
      await dispatch(removeUserLocalArchives(data));
    } else if (val === 'legacyRemoveUserLocalArchive') {
      await dispatch(legacyRemoveUserLocalArchive(data));
    }
    return true;
  };
};
