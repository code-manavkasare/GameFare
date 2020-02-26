import {
  SET_CAPTAINS_CHALLENGE,
  RESET_CHALLENGECREATE_DATA,
  SET_INFO_CHALLENGE,
  SET_LOCATION_CHALLENGE,
  SET_DATE_CHALLENGE,
  SET_PRICE_CHALLENGE,
} from './types';

const setCaptains = (value) => ({
  type: SET_CAPTAINS_CHALLENGE,
  captains: value,
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

const setPrice = (value) => ({
  type: SET_PRICE_CHALLENGE,
  price: value,
});

const reset = () => ({
  type: RESET_CHALLENGECREATE_DATA,
});

export const createChallengeAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setCaptains') {
      await dispatch(setCaptains(data));
    } else if (val === 'setInfo') {
      await dispatch(setInfo(data));
    } else if (val === 'setLocation') {
      await dispatch(setLocation(data));
    } else if (val === 'setDate') {
      await dispatch(setDate(data));
    } else if (val === 'setPrice') {
      await dispatch(setPrice(data));
    } else if (val === 'reset') {
      await dispatch(reset());
    }

    return true;
  };
};
