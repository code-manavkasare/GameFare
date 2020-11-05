import {dissoc} from 'ramda';

import {
  DELETE_SESSION,
  RESET_SESSIONS,
  SET_SESSION,
  SET_SESSION_BINDED,
} from '../types';

const initialState = {};
const initialStateBind = {};

const coachSessionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SESSION:
      const {session} = action;
      return {...state, [session.objectID]: session};
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
      const {sessionID, value} = action;
      return {...state, [sessionID]: value};
    default:
      return state;
  }
};

export {coachSessionsReducer, bindedCoachSessionsReducer};
