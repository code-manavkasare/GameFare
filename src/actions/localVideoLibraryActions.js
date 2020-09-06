import {
  ADD_USER_LOCAL_ARCHIVE,
  REMOVE_USER_LOCAL_ARCHIVE,
} from './types';

export const addUserLocalArchive = (value) => ({
  type: ADD_USER_LOCAL_ARCHIVE,
  archiveID: value.archiveID,
  startTimestamp: value.startTimestamp,

});

export const removeUserLocalArchive = (archiveID) => ({
  type: REMOVE_USER_LOCAL_ARCHIVE,
  archiveID,
});

export const localVideoLibraryAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'addUserLocalArchive') {
      await dispatch(addUserLocalArchive(data));
    } else if (val === 'removeUserLocalArchive') {
      await dispatch(removeUserLocalArchive(data));
    }
    return true;
  };
};
