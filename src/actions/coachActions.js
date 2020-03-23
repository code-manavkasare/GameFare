import {
  RESET_COACH_DATA,
  SET_COACH_SESSION_DATA,
  SET_COACH_SESSION_SETTINGS,
  SET_CURRENT_COACHSESSION_ID,
} from './types';

const setCoachSession = (value) => ({
  type: SET_COACH_SESSION_DATA,
  coachSession: value,
});

const setCoachSessionSettings = (value) => ({
  type: SET_COACH_SESSION_SETTINGS,
  settings: value,
});

const setCurrentCoachSessionID = (value) => ({
  type: SET_CURRENT_COACHSESSION_ID,
  currentSessionID: value,
});

const reset = () => ({
  type: RESET_COACH_DATA,
});

export const coachAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setCoachSession') {
      await dispatch(setCoachSession(data));
    } else if (val === 'setCoachSessionSettings') {
      await dispatch(setCoachSessionSettings(data));
    } else if (val === 'setCurrentCoachSessionID') {
      await dispatch(setCurrentCoachSessionID(data));
    } else if (val === 'reset') {
      await dispatch(reset());
    }
    return true;
  };
};
