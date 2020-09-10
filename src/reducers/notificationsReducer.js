import {
  ADD_NOTIFICATION,
  RESET_NOTIFICATIONS,
  DELETE_NOTIFICATION,
} from '../actions/types.js';

const initialState = [];

const removeNotificationFromArray = (notifications, coachSessionId) => {
  let newNotifications = [];
  for (const notification of notifications) {
    if (notification.data.coachSessionID !== coachSessionId) {
      newNotifications.push(notification);
    }
  }
  return newNotifications;
};

const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return [action.notification, ...state];
    case DELETE_NOTIFICATION:
      return removeNotificationFromArray(state, action.coachSessionId);
    case RESET_NOTIFICATIONS:
      return initialState;
    default:
      return state;
  }
};

export default notificationsReducer;
