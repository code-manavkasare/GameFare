import {
  SET_LAYOUT,
  SET_GENERAL_SESSION_RECORDING,
  SET_CAMERA_AVAILABILITY,
} from '../actions/types';
import {Dimensions} from 'react-native';
const {height, width} = Dimensions.get('screen');

const initialState = {
  isFooterVisible: true,
  activeTab: 'Profile',
  notification: {
    notification: {
      body: '',
    },
    data: {},
  },
  currentScreenSize: {
    currentWidth: width,
    currentHeight: height,
    portrait: true,
  },
  generalSessionRecording: false,

  //Handles unnecessary camera usage
  cameraAvailability: false,
};

const layoutReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LAYOUT:
      return {
        ...state,
        ...action.value,
      };
    case SET_GENERAL_SESSION_RECORDING:
      return {
        ...state,
        generalSessionRecording: action.value,
      };
    case SET_CAMERA_AVAILABILITY:
      return {
        ...state,
        cameraAvailability: action.value,
      };
    default:
      return state;
  }
};

export default layoutReducer;
