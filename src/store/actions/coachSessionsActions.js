import database from '@react-native-firebase/database';

import {
  DELETE_SESSION,
  RESET_SESSIONS,
  SET_SESSION,
  BIND_SESSION,
  UNBIND_SESSION,
  SET_SESSION_BINDED,
  RESET_BINDS_SESSIONS,
} from '../types';

const setSession = (value) => ({
  type: SET_SESSION,
  session: value,
});

const setSessionBinded = (sessionID, value) => ({
  type: SET_SESSION_BINDED,
  sessionID,
  value,
});
const resetBindsSessions = () => ({
  type: RESET_BINDS_SESSIONS,
});

const resetSessions = () => ({
  type: RESET_SESSIONS,
});

const bindSession = (sessionID) => ({
  type: BIND_SESSION,
  sessionID,
});

const unbindSession = (sessionID) => ({
  type: UNBIND_SESSION,
  sessionID,
});

const deleteSession = (sessionId) => {
  database()
    .ref(`coachSessions/${sessionId}`)
    .off();
  return {type: DELETE_SESSION, sessionId};
};

const coachSessionsAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setSession') {
      await dispatch(setSession(data));
    } else if (val === 'resetSessions') {
      await dispatch(resetSessions(data));
    } else if (val === 'bindSession') {
      await dispatch(bindSession(data));
    } else if (val === 'unbindSession') {
      await dispatch(unbindSession(data));
    } else if (val === 'deleteSession') {
      await dispatch(deleteSession(data));
    }
    return true;
  };
};

export {
  coachSessionsAction,
  deleteSession,
  resetSessions,
  setSession,
  bindSession,
  unbindSession,
  resetBindsSessions,
  setSessionBinded,
};
