import {SET_LAYOUT} from './types';

export const setLayout = (value) => ({
  type: SET_LAYOUT,
  value,
});

export const layoutAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setLayout') {
      await dispatch(setLayout(data));
    }
    return true;
  };
};
