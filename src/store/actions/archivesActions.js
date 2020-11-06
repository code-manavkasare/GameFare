import {
  DELETE_ARCHIVE,
  DELETE_ARCHIVES,
  RESET_ARCHIVES,
  SET_ARCHIVE,
  BIND_ARCHIVE,
  UNBIND_ARCHIVE,
  RESET_CLOUD_ARCHIVES,
  SET_ARCHIVE_BINDED,
  SET_ARCHIVES,
  RESET_BINDS_ARCHIVES,
} from '../types';

const setArchive = (archive) => ({
  type: SET_ARCHIVE,
  archive,
});

const setArchiveBinded = (objectID, value) => ({
  type: SET_ARCHIVE_BINDED,
  objectID,
  value,
});

const resetCloudArchives = () => ({
  type: RESET_CLOUD_ARCHIVES,
});

const resetArchives = () => ({
  type: RESET_ARCHIVES,
});

const resetBindsArchives = () => ({
  type: RESET_BINDS_ARCHIVES,
});

const bindArchive = (archiveID) => ({
  type: BIND_ARCHIVE,
  archiveID,
});

const setArchives = (archives) => ({
  type: SET_ARCHIVES,
  archives,
});

const unbindArchive = (archiveID) => ({
  type: UNBIND_ARCHIVE,
  archiveID,
});

const deleteArchive = (archiveID) => {
  return {type: DELETE_ARCHIVE, archiveID};
};

const deleteArchives = (archiveIDs) => {
  return {type: DELETE_ARCHIVES, archiveIDs};
};

const archivesAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setArchive') {
      await dispatch(setArchive(data));
    } else if (val === 'resetArchives') {
      await dispatch(resetArchives(data));
    } else if (val === 'resetCloudArchives') {
      await dispatch(resetCloudArchives(data));
    } else if (val === 'bindArchive') {
      await dispatch(bindArchive(data));
    } else if (val === 'unbindArchive') {
      await dispatch(unbindArchive(data));
    } else if (val === 'deleteArchive') {
      await dispatch(deleteArchive(data));
    } else if (val === 'deleteArchives') {
      await dispatch(deleteArchives(data));
    }
    return true;
  };
};

export {
  archivesAction,
  deleteArchive,
  deleteArchives,
  resetArchives,
  setArchive,
  bindArchive,
  unbindArchive,
  resetCloudArchives,
  setArchiveBinded,
  setArchives,

  resetBindsArchives
};
