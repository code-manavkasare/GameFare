import {dissoc} from 'ramda';

import {
  DELETE_ARCHIVE,
  DELETE_ARCHIVES,
  RESET_ARCHIVES,
  SET_ARCHIVE,
  RESET_CLOUD_ARCHIVES,
  SET_ARCHIVES,
  RESET_BINDS_ARCHIVES,
} from '../types';

const initialState = {};

const archivesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ARCHIVE:
      const {archive} = action;
      return {...state, [archive.id]: {...state[archive.id], ...archive}};
    case SET_ARCHIVES:
      const {archives} = action;
      return {...state, ...archives};
    case RESET_BINDS_ARCHIVES:
      return Object.values(state).reduce(function(result, item) {
        result[item.id] = {...item, isBinded: false};
        return result;
      }, {});
    case DELETE_ARCHIVE:
      const {archiveID} = action;
      return dissoc(archiveID, state);
    case DELETE_ARCHIVES:
      const {archiveIDs} = action;
      return archiveIDs.reduce((newState, id) => dissoc(id, newState), state);
    case RESET_CLOUD_ARCHIVES:
      const newArchives = Object.values(state)
        .filter((item) => item?.local)
        .reduce(function(result, item) {
          result[item.id] = item;
          return result;
        }, {});
      return newArchives;
    case RESET_ARCHIVES:
      return initialState;
    default:
      return state;
  }
};

export {archivesReducer};
