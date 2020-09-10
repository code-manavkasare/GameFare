import {
  ADD_NOTIFICATION,
  CLEAR_NOTIFICATIONS,
  DELETE_NOTIFICATION,
} from './types';

const addNotification = (notification) => ({
  type: ADD_NOTIFICATION,
  notification: notification,
});

const deleteNotification = (coachSessionId) => ({
  type: DELETE_NOTIFICATION,
  coachSessionId,
});

const clearNotifications = () => ({
  type: CLEAR_NOTIFICATIONS,
});

export {addNotification, clearNotifications, deleteNotification};
