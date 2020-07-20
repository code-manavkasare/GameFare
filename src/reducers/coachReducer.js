import {
  RESET_COACH_DATA,
  SET_COACH_SESSION_DATA,
  SET_COACH_SESSION_SETTINGS,
  SET_CURRENT_COACHSESSION_ID,
  SET_CURRENT_SESSION,
  SET_COACH_SESSION_DRAW_SETTINGS,
  END_CURRENT_SESSION,
  UNSET_CURRENT_SESSION,
  SET_RECORDING,
  SET_ALL_SESSIONS,
  SET_CURRENT_SESSION_RECONNECTING,
} from '../actions/types';
import colors from '../components/style/colors';

const initialState = {
  endCurrentSession: false,
  recording: false,
  reconnecting: false,
  currentSession: {},
  currentSessionID: false,
  settingsDraw: {
    color: colors.red,
    clear: false,
    undo: false,
    touchEnabled: true,
  },
  allSessions: {},
};

const coachReducer = (state = initialState, action) => {
  switch (action.type) {
    case END_CURRENT_SESSION:
      return {...state, endCurrentSession: true};
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
        currentSession: action.currentSession,
        currentSessionID: action.currentSession
          ? action.currentSession.objectID
          : false,
      };
    case UNSET_CURRENT_SESSION:
      return {
        ...state,
        endCurrentSession: false,
        reconnecting: false,
        currentSession: {},
        currentSessionID: false,
      };
    case SET_ALL_SESSIONS:
      return {
        ...state,
        allSessions: {
          ...state.allSessions,
          ...action.allSessions,
        },
      };
    case SET_CURRENT_COACHSESSION_ID:
      return {...state, currentSessionID: action.currentSessionID};
    case SET_RECORDING:
      return {...state, recording: action.recording};
    case SET_CURRENT_SESSION_RECONNECTING:
      return {...state, reconnecting: action.reconnecting};
    case RESET_COACH_DATA:
      return initialState;
    default:
      return state;
  }
};

export default coachReducer;
