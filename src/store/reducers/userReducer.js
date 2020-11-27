import {
  SET_USER_INFO,
  RESET_USER_INFO,
  SET_USER_CLOUD_ARCHIVES,
  RESET_USER_CLOUD_ARCHIVES,
  SET_USER_SESSIONS,
  RESET_USER_SESSIONS,
  SET_USER_SESSIONS_REQUESTS,
  RESET_USER_SESSIONS_REQUESTS,
  SET_USER_NOTIFICATIONS,
  RESET_USER_NOTIFICATIONS,
  SET_USER_BLOCKED_USERS,
  RESET_USER_BLOCKED_USERS,
  SET_USER_BLOCKED_BY_USERS,
  RESET_USER_BLOCKED_BY_USERS,
  SET_USER_SILENT_FRIENDS,
  RESET_USER_SILENT_FRIENDS,
} from '../types';

const initialState = {
  userConnected: false,
  userID: '',
  phoneNumber: '',
  infoUser: {
    userInfo: {},
    defaultCard: {},
    wallet: {},
  },
  country: {
    name: 'United States',
    dial_code: '+1',
    code: 'US',
  },
};

const initialStateCloudArchives = {
  ['demoVideo']: {
    startTimestamp: Date.now(),
    id: 'demoVideo',
  },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return {...state, ...action.userInfo};
    case RESET_USER_INFO:
      return initialState;

    default:
      return state;
  }
};

const userCloudArchivesReducer = (
  state = initialStateCloudArchives,
  action,
) => {
  switch (action.type) {
    case SET_USER_CLOUD_ARCHIVES:
      return {...action.archives};
    case RESET_USER_CLOUD_ARCHIVES:
      return initialStateCloudArchives;
    default:
      return state;
  }
};

const initialStateCoachSessions = {};
const userSessionsReducer = (state = initialStateCoachSessions, action) => {
  switch (action.type) {
    case SET_USER_SESSIONS:
      return {...action.sessions};
    case RESET_USER_SESSIONS:
      return initialStateCoachSessions;
    default:
      return state;
  }
};

const initialCoachSessionsRequests = {};
const userSessionsRequestsReducer = (
  state = initialCoachSessionsRequests,
  action,
) => {
  switch (action.type) {
    case SET_USER_SESSIONS_REQUESTS:
      return {...action.sessions};
    case RESET_USER_SESSIONS_REQUESTS:
      return initialCoachSessionsRequests;
    default:
      return state;
  }
};

const initialNotifications = {};
const userNotificationsReducer = (state = initialNotifications, action) => {
  switch (action.type) {
    case SET_USER_NOTIFICATIONS:
      return {...action.notifications};
    case RESET_USER_NOTIFICATIONS:
      return initialNotifications;
    default:
      return state;
  }
};

const initialBlockedUsers = {};
const userBlockedUsersReducer = (state = initialBlockedUsers, action) => {
  switch (action.type) {
    case SET_USER_BLOCKED_USERS:
      return {...action.users};
    case RESET_USER_BLOCKED_USERS:
      return initialBlockedUsers;
    default:
      return state;
  }
};

const initialBlockedByUsers = {};
const userBlockedByUsersReducer = (state = initialBlockedByUsers, action) => {
  switch (action.type) {
    case SET_USER_BLOCKED_BY_USERS:
      return {...action.users};
    case RESET_USER_BLOCKED_BY_USERS:
      return initialBlockedByUsers;
    default:
      return state;
  }
};

const initialSilentFriends = {};
const userSilentFriendsReducer = (state = initialSilentFriends, action) => {
  switch (action.type) {
    case SET_USER_SILENT_FRIENDS:
      return {...action.users};
    case RESET_USER_SILENT_FRIENDS:
      return initialSilentFriends;
    default:
      return state;
  }
};

export {
  userReducer,
  userCloudArchivesReducer,
  userNotificationsReducer,
  userSessionsReducer,
  userSessionsRequestsReducer,
  userBlockedUsersReducer,
  userBlockedByUsersReducer,
  userSilentFriendsReducer,
};
