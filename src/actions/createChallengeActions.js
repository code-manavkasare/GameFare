import {
  SET_MEMBERS_CHALLENGE,
  RESET_CHALLENGECREATE_DATA,
  SET_INFO_CHALLENGE,
  SET_LOCATION_CHALLENGE,
  SET_DATE_CHALLENGE,
} from './types';

const setMembers = (value) => ({
  type: SET_MEMBERS_CHALLENGE,
  members: value,
});

const setInfo = (value) => ({
  type: SET_INFO_CHALLENGE,
  info: value,
});

const setLocation = (value) => ({
  type: SET_LOCATION_CHALLENGE,
  location: value,
});

const setDate = (value) => ({
  type: SET_DATE_CHALLENGE,
  date: value,
});

const reset = () => ({
  type: RESET_CHALLENGECREATE_DATA,
});

export const createChallengeAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setMembers') {
      await dispatch(setMembers(data));
    } else if (val === 'setInfo') {
      await dispatch(setInfo(data));
    } else if (val === 'setLocation') {
      await dispatch(setLocation(data));
    } else if (val === 'setDate') {
      await dispatch(setDate(data));
    } else if (val === 'reset') {
      await dispatch(reset());
    }

    return true;
  };
};
