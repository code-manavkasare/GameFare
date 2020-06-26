import {
    TOGGLE_BATTERY_SAVER,
  } from './types';

  const toggleBatterySaver = () => ({
    type: TOGGLE_BATTERY_SAVER,
  });

  export const appSettingsAction = (val, data) =>{
    return async function(dispatch) {
      if (val === 'toggleBatterySaver') {
        await dispatch(toggleBatterySaver());
      }
      return true;
    };
  };
