import {
  SET_USER_INFO,
  RESET_USER_INFO,
  SET_LAYOUT_SETTINGS,
  HIDE_FOOTER_APP,
} from '../actions/types';

const initialState = {
  userConnected: false,
  layoutSettings: {
    footerIsVisible: true,
  },
  infoUser: {
    userInfo: {},
    wallet: {},
    defaultCard: {},
    archivedStreams: {
      ['demoVideo']: {
        startTimestamp: Date.now(),
        id: 'demoVideo',
      },
    },
  },
  userID: '',
  phoneNumber: '',
  userIDSaved: '',
  country: {
    name: 'United States',
    dial_code: '+1',
    code: 'US',
  },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return {...state, ...action.userInfo};
    case RESET_USER_INFO:
      return initialState;
    case SET_LAYOUT_SETTINGS:
      return {
        ...state,
        layoutSettings: {...state.layoutSettings, ...action.layoutSettings},
      };
    case HIDE_FOOTER_APP:
      return {
        ...state,
        layoutSettings: {
          ...state.layoutSettings,
          footerIsVisible: !state.layoutSettings.footerIsVisible,
        },
      };
    default:
      return state;
  }
};

export default userReducer;
