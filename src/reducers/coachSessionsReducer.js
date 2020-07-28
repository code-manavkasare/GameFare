import {dissoc} from 'ramda';

import {DELETE_SESSION, RESET_SESSIONS, SET_SESSION} from '../actions/types';

const initialState = {};

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

export default coachSessionsReducer;
