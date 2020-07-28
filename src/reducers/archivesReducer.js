import {dissoc} from 'ramda';

import {DELETE_ARCHIVE, RESET_ARCHIVES, SET_ARCHIVE} from '../actions/types';

const initialState = {};

const archivesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ARCHIVE:
      const {archive} = action;
      return {...state, [archive.id]: archive};
    case DELETE_ARCHIVE:
      const {archiveId} = action;
      console.log('archiveId DELETE_ARCHIVE: ', archiveId);
      return dissoc(archiveId, state);
    case RESET_ARCHIVES:
      return initialState;
    default:
      return state;
  }
};

export default archivesReducer;
