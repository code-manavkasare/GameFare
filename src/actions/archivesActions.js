import database from '@react-native-firebase/database';

import {
  DELETE_ARCHIVE,
  RESET_ARCHIVES,
  SET_ARCHIVE,
  SET_ARCHIVE_BINDED,
} from './types';

const setArchive = (value) => ({
  type: SET_ARCHIVE,
  archive: value,
});

const resetArchives = () => ({
  type: RESET_ARCHIVES,
});

const setArchiveBinded = (value) => ({
  type: SET_ARCHIVE_BINDED,
  archive: value,
});

const deleteArchive = (archiveId) => {
  database()
    .ref(`archivedStreams/${archiveId}`)
    .off();
  return {type: DELETE_ARCHIVE, archiveId};
};

export {deleteArchive, resetArchives, setArchive, setArchiveBinded};
