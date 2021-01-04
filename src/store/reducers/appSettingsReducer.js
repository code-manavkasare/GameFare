import {SET_BUILD_NUMBER, TOGGLE_WIFI_AUTO_UPLOAD} from '../types';

const initialState = {
  buildNumber: null,
  wifiAutoUpload: true,
};

const appSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_BUILD_NUMBER:
      return {...state, buildNumber: action.buildNumber};

    case TOGGLE_WIFI_AUTO_UPLOAD:
      return {...state, wifiAutoUpload: !state.wifiAutoUpload};
    default:
      return state;
  }
};

export default appSettingsReducer;
