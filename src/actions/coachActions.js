import {
  RESET_COACH_DATA,
  SET_COACH_SESSION_DATA,
  SET_COACH_SESSION_SETTINGS,
  SET_CURRENT_SESSION,
  SET_CURRENT_COACHSESSION_ID,
  SET_SESSION_INFO,
  SET_COACH_SESSION_DRAW_SETTINGS,
  SET_ALL_SESSIONS,
} from './types';

const setCoachSession = (value) => ({
  type: SET_COACH_SESSION_DATA,
  coachSession: value,
});

const setCoachSessionSettings = (value) => ({
  type: SET_COACH_SESSION_SETTINGS,
  settings: value,
});

const setSessionInfo = (sessionInfo) => ({
  type: SET_SESSION_INFO,
  sessionInfo: sessionInfo,
});

const setCoachSessionDrawSettings = (value) => ({
  type: SET_COACH_SESSION_DRAW_SETTINGS,
  settingsDraw: value,
});

export const resetDataCoachSession = () => ({
  type: RESET_COACH_DATA,
});

export const setCurrentSession = (session) => ({
  type: SET_CURRENT_SESSION,
  currentSession: session,
});

export const setCurrentSessionID = (coachSessionID) => ({
  type: SET_CURRENT_COACHSESSION_ID,
  currentSessionID: coachSessionID,
});

export const setAllSessions = (value) => ({
  type: SET_ALL_SESSIONS,
  allSessions: value,
});

export const coachAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setCoachSession') {
      await dispatch(setCoachSession(data));
    } else if (val === 'setCoachSessionSettings') {
      await dispatch(setCoachSessionSettings(data));
    } else if (val === 'setCoachSessionDrawSettings') {
      await dispatch(setCoachSessionDrawSettings(data));
    } else if (val === 'setSessionInfo') {
      await dispatch(setSessionInfo(data));
    } else if (val === 'setCurrentSession') {
      await dispatch(setCurrentSession(data));
    } else if (val === 'setCurrentSessionID') {
      await dispatch(setCurrentSessionID(data));
    } else if (val === 'setAllSessions') {
      await dispatch(setAllSessions(data));
    } else if (val === 'reset') {
      await dispatch(resetDataCoachSession());
    }
    return true;
  };
};
