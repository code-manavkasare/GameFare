import {dissoc} from 'ramda';

import {
  DELETE_SESSION,
  RESET_SESSIONS,
  SET_SESSION,
  SET_SESSION_BINDED,
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
    case SET_SESSION_BINDED:
      const {session} = action;
      return {...state, [session.id]: session.isBinded};
    default:
      return state;
  }
};

export {coachSessionsReducer, bindedCoachSessionsReducer};
