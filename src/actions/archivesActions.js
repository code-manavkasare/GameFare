import database from '@react-native-firebase/database';

import {DELETE_ARCHIVE, RESET_ARCHIVES, SET_ARCHIVE} from './types';

const setArchive = (value) => ({
  type: SET_ARCHIVE,
  archive: value,
});

const resetArchives = () => ({
  type: RESET_ARCHIVES,
});

const deleteArchive = (archiveId) => {
  database()
    .ref(`archivedStreams/${archiveId}`)
    .off();
  return {type: DELETE_ARCHIVE, archiveId};
};

export {deleteArchive, resetArchives, setArchive};
