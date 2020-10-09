import {
  TOGGLE_BATTERY_SAVER,
  TOGGLE_WIFI_AUTO_UPLOAD,
} from '../actions/types';

const initialState = {
  batterySaver: false,
  wifiAutoUpload: true,
};

const appSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_BATTERY_SAVER:
      return {...state, batterySaver: !state.batterySaver};
    case TOGGLE_WIFI_AUTO_UPLOAD:
      return {...state, wifiAutoUpload: !state.wifiAutoUpload};
    default:
      return state;
  }
};

export default appSettingsReducer;
