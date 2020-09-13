import {combineReducers} from 'redux';
import {reducer as network} from 'react-native-offline';

import globaleVariablesReducer from './globaleVariablesReducer';
import userReducer from './userReducer';
import historicSearchReducer from './historicSearchReducer';
import createEventReducer from './createEventReducer';
import createChallengeReducer from './createChallengeReducer';
import eventsReducer from './eventsReducer';
import createGroupReducer from './createGroupReducer';
import groupsReducer from './groupsReducer';
import messageReducer from './messageReducer';
import coachReducer from './coachReducer';
import layoutReducer from './layoutReducer';
import uploadQueueReducer from './uploadQueueReducer';
import appSettingsReducer from './appSettingsReducer';
import localVideoLibraryReducer from './localVideoLibraryReducer';
import notificationsReducer from './notificationsReducer';
import {archivesReducer, bindedArchivesReducer} from './archivesReducer';
import {
  coachSessionsReducer,
  bindedCoachSessionsReducer,
} from './coachSessionsReducer';
import {
  conversationsReducer,
  bindedConversationsReducer,
} from './conversationsReducer';
import phoneContactsReducer from './phoneContactsReducer';
import connectionTypeReducer from './connectionTypeReducer';

export default combineReducers({
  appSettings: appSettingsReducer,
  archives: archivesReducer,
  bindedArchives: bindedArchivesReducer,
  bindedConversations: bindedConversationsReducer,
  bindedSessions: bindedCoachSessionsReducer,
  coach: coachReducer,
  coachSessions: coachSessionsReducer,
  connectionType: connectionTypeReducer,
  conversations: conversationsReducer,
  createChallengeData: createChallengeReducer,
  createEventData: createEventReducer,
  createGroup: createGroupReducer,
  events: eventsReducer,
  globaleVariables: globaleVariablesReducer,
  groups: groupsReducer,
  historicSearch: historicSearchReducer,
  layout: layoutReducer,
  localVideoLibrary: localVideoLibraryReducer,
  message: messageReducer,
  network,
  notifications: notificationsReducer,
  phoneContacts: phoneContactsReducer,
  uploadQueue: uploadQueueReducer,
  user: userReducer,
});
