import {dissoc} from 'ramda';

import {
  DELETE_SESSION,
  RESET_BINDS_SESSIONS,
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
    case RESET_BINDS_SESSIONS:
      return Object.values(state).reduce(function(result, item) {
        result[item.id] = {...item, isBinded: false};
        return result;
      }, {});
    case DELETE_SESSION:
      const {sessionId} = action;
      return dissoc(sessionId, state);
    case RESET_SESSIONS:
      return initialState;
    default:
      return state;
  }
};

export {coachSessionsReducer};
