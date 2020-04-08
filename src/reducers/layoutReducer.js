import {SET_LAYOUT} from '../actions/types';

const initialState = {
  isFooterVisible: true,
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
