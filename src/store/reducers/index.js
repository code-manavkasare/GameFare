import {combineReducers} from 'redux';
import {reducer as network} from 'react-native-offline';

import {
  userReducer,
  userCloudArchivesReducer,
  userNotificationsReducer,
  userSessionsReducer,
  userSessionsRequestsReducer,
  userBlockedUsersReducer,
  userBlockedByUsersReducer,
  userSilentFriendsReducer,
} from './userReducer';
import messageReducer from './messageReducer';
import coachReducer from './coachReducer';
import layoutReducer from './layoutReducer';
import uploadQueueReducer from './uploadQueueReducer';
import appSettingsReducer from './appSettingsReducer';
import localVideoLibraryReducer from './localVideoLibraryReducer';
import {archivesReducer} from './archivesReducer';
import {coachSessionsReducer} from './coachSessionsReducer';
import {conversationsReducer} from './conversationsReducer';
import connectionTypeReducer from './connectionTypeReducer';

export default combineReducers({
  appSettings: appSettingsReducer,
  archives: archivesReducer,
  coach: coachReducer,
  coachSessions: coachSessionsReducer,
  connectionType: connectionTypeReducer,
  conversations: conversationsReducer,
  layout: layoutReducer,
  localVideoLibrary: localVideoLibraryReducer,
  message: messageReducer,
  network,
  uploadQueue: uploadQueueReducer,
  user: userReducer,
  userCloudArchives: userCloudArchivesReducer,
  userNotifications: userNotificationsReducer,
  userSessions: userSessionsReducer,
  userSessionsRequests: userSessionsRequestsReducer,
  userBlockedUsers: userBlockedUsersReducer,
  userBlockedByUsers: userBlockedByUsersReducer,
  userSilentFriends: userSilentFriendsReducer,
});
