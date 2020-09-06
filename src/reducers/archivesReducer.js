import {dissoc} from 'ramda';

import {
  DELETE_ARCHIVE,
  RESET_ARCHIVES,
  SET_ARCHIVE,
  SET_ARCHIVE_BINDED,
} from '../actions/types';

const initialState = {};
const initialStateBind = {};

const archivesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ARCHIVE:
      const {archive} = action;
      return {...state, [archive.id]: archive};
    case DELETE_ARCHIVE:
      const {archiveID} = action;
      return dissoc(archiveID, state);
    case RESET_ARCHIVES:
      return initialState;
    default:
      return state;
  }
};

const bindedArchivesReducer = (state = initialStateBind, action) => {
  switch (action.type) {
    case SET_ARCHIVE_BINDED:
      const {archive} = action;
      return {...state, [archive.id]: archive.isBinded};
    case DELETE_ARCHIVE:
      const {archiveID} = action;
      return dissoc(archiveID, state);
    default:
      return state;
  }
};

export {archivesReducer, bindedArchivesReducer};
