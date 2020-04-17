import {
  RESET_COACH_DATA,
  SET_COACH_SESSION_DATA,
  SET_COACH_SESSION_SETTINGS,
  SET_CURRENT_COACHSESSION_ID,
  SET_SESSION_INFO,
  SET_COACH_SESSION_DRAW_SETTINGS,
} from '../actions/types';

const initialState = {
  coachSession: {
    objectID: false,
  },
  currentSessionID: false,
  settingsDraw: {
    color: 'red',
    clear: false,
    undo: false,
    touchEnabled: true,
  },
  settings: {
    cameraFront: false,
    shareScreen: false,
    draw: false,
  },
  sessionInfo: {
    objectID: false,
    autoOpen: false,
    scrollDisabled:false,
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
    case SET_COACH_SESSION_DRAW_SETTINGS:
      return {
        ...state,
        settingsDraw: {...state.settingsDraw, ...action.settingsDraw},
      };
    case SET_SESSION_INFO:
      return {
        ...state,
        sessionInfo: {...state.sessionInfo, ...action.sessionInfo},
      };
    case RESET_COACH_DATA:
      console.log('RESET_COACH_DATA', initialState);
      return initialState;
    default:
      return state;
  }
};

export default coachReducer;
