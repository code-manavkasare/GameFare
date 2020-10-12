import {dissoc} from 'ramda';

import {
  DELETE_ARCHIVE,
  DELETE_ARCHIVES,
  RESET_ARCHIVES,
  SET_ARCHIVE,
  BIND_ARCHIVE,
  UNBIND_ARCHIVE,
  RESET_CLOUD_ARCHIVES,
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

const bindedArchivesReducer = (state = initialStateBind, action) => {
  switch (action.type) {
    case BIND_ARCHIVE: {
      const {archiveID} = action;
      if (archiveID) {
        const bindCount = state[archiveID];
        if (bindCount) {
          return {...state, [archiveID]: bindCount + 1};
        }
        return {...state, [archiveID]: 1};
      }
      return state;
    }
    case UNBIND_ARCHIVE: {
      const {archiveID} = action;
      if (archiveID) {
        const bindCount = state[archiveID];
        if (bindCount) {
          return {...state, [archiveID]: bindCount === 0 ? 0 : bindCount - 1};
        }
        return {...state, [archiveID]: 0};
      }
      return state;
    }
    case DELETE_ARCHIVES: {
      const {archiveIDs} = action;
      return archiveIDs.reduce((newState, id) => dissoc(id, newState), state);
    }
    default:
      return state;
  }
};

export {archivesReducer, bindedArchivesReducer};
