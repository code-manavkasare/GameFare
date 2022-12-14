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
  userClubsReducer,
  userBookingsReducer,
} from './userReducer';
import messageReducer from './messageReducer';
import coachReducer from './coachReducer';
import layoutReducer from './layoutReducer';
import intialInteractionReducer from './intialInteractionReducer';
import uploadQueueReducer from './uploadQueueReducer';
import appSettingsReducer from './appSettingsReducer';
import localVideoLibraryReducer from './localVideoLibraryReducer';
import {archivesReducer} from './archivesReducer';
import {coachSessionsReducer} from './coachSessionsReducer';
import {conversationsReducer} from './conversationsReducer';
import connectionTypeReducer from './connectionTypeReducer';
import {clubsReducer} from './clubsReducer';
import {servicesReducer} from './servicesReducer';
import {bookingsReducer} from './bookingsReducer';
import {postsReducer} from './postsReducer';
import {usersReducer} from './usersReducer';

export default combineReducers({
  appSettings: appSettingsReducer,
  archives: archivesReducer,
  coach: coachReducer,
  coachSessions: coachSessionsReducer,
  connectionType: connectionTypeReducer,
  conversations: conversationsReducer,
  initialInteractions: intialInteractionReducer,
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
  userClubs: userClubsReducer,
  clubs: clubsReducer,
  services: servicesReducer,
  bookings: bookingsReducer,
  posts: postsReducer,
  userBookings: userBookingsReducer,
  users: usersReducer,
});
