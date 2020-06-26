import {
  RESET_COACH_DATA,
  SET_COACH_SESSION_DATA,
  SET_COACH_SESSION_SETTINGS,
  SET_CURRENT_COACHSESSION_ID,
  SET_CURRENT_SESSION,
  SET_COACH_SESSION_DRAW_SETTINGS,
} from '../actions/types';
import colors from '../components/style/colors';

const initialState = {
  currentSession: {},
  currentSessionID: false,
  settingsDraw: {
    color: colors.red,
    clear: false,
    undo: false,
    touchEnabled: true,
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
    case SET_CURRENT_SESSION:
      return {
        ...state,
        currentSession: {...state.currentSession, ...action.currentSession},
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
