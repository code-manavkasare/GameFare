import {SET_VARIABLES, SET_FIREBASE_BINDINGS_STATE} from '../types';

const initialState = {
  isBindToFirebase: false,
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
    case SET_FIREBASE_BINDINGS_STATE:
      return {...state, isBindToFirebase: action.value.isBindToFirebase};
    default:
      return state;
  }
};

export default globaleVariablesReducer;
