import {
  SET_BUILD_NUMBER,
  TOGGLE_BATTERY_SAVER,
  TOGGLE_WIFI_AUTO_UPLOAD,
} from '../actions/types';

const initialState = {
  buildNumber: null,
  batterySaver: false,
  wifiAutoUpload: true,
};

const appSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_BUILD_NUMBER:
      return {...state, buildNumber: action.buildNumber};
    case TOGGLE_BATTERY_SAVER:
      return {...state, batterySaver: !state.batterySaver};
    case TOGGLE_WIFI_AUTO_UPLOAD:
      return {...state, wifiAutoUpload: !state.wifiAutoUpload};
    default:
      return state;
  }
};

export default appSettingsReducer;
