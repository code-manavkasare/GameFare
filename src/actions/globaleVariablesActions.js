import {
    SET_VARIABLES,
    TOGGLE_BATTERY_SAVER,
  } from './types';

  const setVariables = (value) => ({
    type: SET_VARIABLES,
    value: value,
  });

  export const globaleVariablesAction = (val, data) =>{
    return async function(dispatch) {
      if (val === 'setVariables') {
        await dispatch(setVariables(data));
      }
      return true;
    };
  };
