import {
  SET_BUILD_NUMBER, 
  TOGGLE_WIFI_AUTO_UPLOAD,
} from '../types';

export const setCurrentBuildNumber = (value) => ({
  type: SET_BUILD_NUMBER,
  buildId: value,
});
 
const toggleWifiAutoUpload = () => ({
  type: TOGGLE_WIFI_AUTO_UPLOAD,
});

export const appSettingsAction = (val, data) => {
  return async function(dispatch) {
 if (val === 'toggleWifiAutoUpload') {
      await dispatch(toggleWifiAutoUpload());
    } else if (val === 'setCurrentBuildNumber') {
      await dispatch(setCurrentBuildNumber(data));
    }
    return true;
  };
};
