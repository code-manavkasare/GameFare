import {SET_ARCHIVE} from './types';

const setArchive = (value) => ({
  type: SET_ARCHIVE,
  archive: value,
});

export {setArchive};
