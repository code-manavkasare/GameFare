import {SET_LAYOUT} from '../actions/types';
import {Dimensions} from 'react-native';
const {height, width} = Dimensions.get('screen');

const initialState = {
  isFooterVisible: true,
  activeTab: 'Profile',
  notification: {
    notification: {
      image: '',
    },
  },
  currentScreenSize: {
    currentWidth: width,
    currentHeight: height,
    portrait: true,
  },
};

const layoutReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LAYOUT:
      return {
        ...state,
        ...action.value,
      };
    default:
      return state;
  }
};

export default layoutReducer;
