import {TOGGLE_BATTERY_SAVER, TOGGLE_WIFI_AUTO_UPLOAD} from './types';

const toggleBatterySaver = () => ({
  type: TOGGLE_BATTERY_SAVER,
});

const toggleWifiAutoUpload = () => ({
  type: TOGGLE_WIFI_AUTO_UPLOAD,
});

export const appSettingsAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'toggleBatterySaver') {
      await dispatch(toggleBatterySaver());
    } else if (val === 'toggleWifiAutoUpload') {
      await dispatch(toggleWifiAutoUpload());
    }
    return true;
  };
};
