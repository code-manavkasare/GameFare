import {
  SET_USER_INFO,
  RESET_USER_INFO,
  SET_LAYOUT_SETTINGS,
  HIDE_FOOTER_APP,
  SET_ARCHIVE_FIREBASE_BIND_STATUS,
  SET_COACH_SESSION_FIREBASE_BIND_STATUS,
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
    case SET_ARCHIVE_FIREBASE_BIND_STATUS:
      return {
        ...state,
        infoUser: {
          ...state.infoUser,
          archivedStreams: {
            ...state.infoUser.archivedStreams,
            [action.archiveId]: {
              ...state.infoUser.archivedStreams[action.archiveId],
              isBindToFirebase: action.isBindToFirebase,
            },
          },
        },
      };
    case SET_COACH_SESSION_FIREBASE_BIND_STATUS:
      return {
        ...state,
        infoUser: {
          ...state.infoUser,
          coachSessions: {
            ...state.infoUser.coachSessions,
            [action.coachSessionId]: {
              ...state.infoUser.coachSessions[action.coachSessionId],
              isBindToFirebase: action.isBindToFirebase,
            },
          },
        },
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
