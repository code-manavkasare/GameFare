import {dissoc} from 'ramda';

import {
  DELETE_SESSION,
  RESET_SESSIONS,
  SET_SESSION,
  BIND_SESSION,
  UNBIND_SESSION,
} from '../actions/types';

const initialState = {};
const initialStateBind = {};

const coachSessionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SESSION:
      const {session} = action;
      if (session?.objectID) {
        return {...state, [session.objectID]: session};
      } else {
        return state;
      }
    case DELETE_SESSION:
      const {sessionId} = action;
      return dissoc(sessionId, state);
    case RESET_SESSIONS:
      return initialState;
    default:
      return state;
  }
};

const bindedCoachSessionsReducer = (state = initialStateBind, action) => {
  switch (action.type) {
    case BIND_SESSION: {
      const {sessionID} = action;
      if (sessionID) {
        const bindCount = state[sessionID];
        if (bindCount) {
          return {...state, [sessionID]: bindCount + 1};
        }
        return {...state, [sessionID]: 1};
      }
      return state;
    }
    case UNBIND_SESSION: {
      const {sessionID} = action;
      if (sessionID) {
        const bindCount = state[sessionID];
        if (bindCount) {
          return {...state, [sessionID]: bindCount - 1};
        }
        return {...state, [sessionID]: 0};
      }
      return state;
    }
    default:
      return state;
  }
};

export {coachSessionsReducer, bindedCoachSessionsReducer};
