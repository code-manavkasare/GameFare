import {
  RESET_COACH_DATA,
  SET_COACH_SESSION_DATA,
  SET_COACH_SESSION_SETTINGS,
  SET_CURRENT_COACHSESSION_ID,
} from '../actions/types';

const initialState = {
  coachSession: {
    objectID: false,
  },
  currentSessionID: false,
  settings: {
    cameraFront: false,
    shareScreen: false,
    draw: false,
  },
};

const coachReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_COACH_SESSION_DATA:
      return {
        ...state,
        coachSession: {...state.coachSession, ...action.coachSession},
      };
    case SET_COACH_SESSION_SETTINGS:
      return {
        ...state,
        settings: {...state.settings, ...action.settings},
      };
    case SET_CURRENT_COACHSESSION_ID:
      return {...state, currentSessionID: action.currentSessionID};
    case RESET_COACH_DATA:
      return initialState;
    default:
      return state;
  }
};

export default coachReducer;
