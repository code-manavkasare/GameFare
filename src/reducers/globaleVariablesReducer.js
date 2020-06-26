import {SET_VARIABLES, TOGGLE_BATTERY_SAVER} from '../actions/types';

const initialState = {
  tabs: {
    home: {},
  },
  footerIsVisible: true,
  sports: {
    list: [
      {
        card: {
          img: {},
          color: {},
        },
      },
    ],
  },
};

const globaleVariablesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_VARIABLES:
      return {...action.value, batterySaver: false};
    default:
      return state;
  }
};

export default globaleVariablesReducer;
