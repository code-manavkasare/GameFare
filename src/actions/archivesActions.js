import database from '@react-native-firebase/database';

import {
  DELETE_ARCHIVE,
  RESET_ARCHIVES,
  SET_ARCHIVE,
  SET_ARCHIVE_BINDED,
} from './types';

const setArchive = (archive) => ({
  type: SET_ARCHIVE,
  archive,
});

const resetArchives = () => ({
  type: RESET_ARCHIVES,
});

const setArchiveBinded = (value) => ({
  type: SET_ARCHIVE_BINDED,
  archive: value,
});

const deleteArchive = (archiveID) => {
  database()
    .ref(`archivedStreams/${archiveID}`)
    .off();
  return {type: DELETE_ARCHIVE, archiveID};
};

export {deleteArchive, resetArchives, setArchive, setArchiveBinded};
