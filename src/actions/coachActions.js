import {
  RESET_COACH_DATA,
  SET_COACH_SESSION_DATA,
  SET_COACH_SESSION_SETTINGS,
  SET_CURRENT_SESSION,
  SET_CURRENT_COACHSESSION_ID,
  SET_SESSION_INFO,
  SET_COACH_SESSION_DRAW_SETTINGS,
  END_CURRENT_SESSION,
  UNSET_CURRENT_SESSION,
  SET_RECORDING,
  SET_ALL_SESSIONS,
  SET_CURRENT_SESSION_RECONNECTING,
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

export const endCurrentSession = () => ({
  type: END_CURRENT_SESSION,
});

const unsetCurrentSession = () => ({
  type: UNSET_CURRENT_SESSION,
});

const setRecording = (recording) => ({
  type: SET_RECORDING,
  recording: recording,
});

export const setAllSessions = (value) => ({
  type: SET_ALL_SESSIONS,
  allSessions: value,
});

const setCurrentSessionReconnecting = (value) => ({
  type: SET_CURRENT_SESSION_RECONNECTING,
  reconnecting: value,
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
    } else if (val === 'endCurrentSession') {
      await dispatch(endCurrentSession());
    } else if (val === 'unsetCurrentSession') {
      await dispatch(unsetCurrentSession());
    } else if (val === 'setRecording') {
      await dispatch(setRecording(data));
    } else if (val === 'setCurrentSessionReconnecting') {
      await dispatch(setCurrentSessionReconnecting(data));
    }
    return true;
  };
};
