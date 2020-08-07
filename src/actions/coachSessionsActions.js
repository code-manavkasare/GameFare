import database from '@react-native-firebase/database';

import {
  DELETE_SESSION,
  RESET_SESSIONS,
  SET_SESSION,
  SET_SESSION_BINDED,
} from './types';

const setSession = (value) => ({
  type: SET_SESSION,
  session: value,
});

const resetSessions = () => ({
  type: RESET_SESSIONS,
});

const setSessionBinded = (value) => ({
  type: SET_SESSION_BINDED,
  session: value,
});

const deleteSession = (sessionId) => {
  database()
    .ref(`coachSessions/${sessionId}`)
    .off();
  return {type: DELETE_SESSION, sessionId};
};

module.exports = {deleteSession, resetSessions, setSession, setSessionBinded};
