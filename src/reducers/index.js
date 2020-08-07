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
import {archivesReducer, bindedArchivesReducer} from './archivesReducer.js';
import {
  coachSessionsReducer,
  bindedCoachSessionsReducer,
} from './coachSessionsReducer.js';
import {
  conversationsReducer,
  bindedConversationsReducer,
} from './conversationsReducer';
import phoneContactsReducer from './phoneContactsReducer.js';

export default combineReducers({
  globaleVariables: globaleVariablesReducer,
  appSettings: appSettingsReducer,
  user: userReducer,
  coach: coachReducer,
  historicSearch: historicSearchReducer,
  createEventData: createEventReducer,
  createChallengeData: createChallengeReducer,
  events: eventsReducer,
  groups: groupsReducer,
  createGroup: createGroupReducer,
  message: messageReducer,
  layout: layoutReducer,
  uploadQueue: uploadQueueReducer,
  localVideoLibrary: localVideoLibraryReducer,
  archives: archivesReducer,
  bindedArchives: bindedArchivesReducer,
  coachSessions: coachSessionsReducer,
  bindedSessions: bindedCoachSessionsReducer,
  network,
  conversations: conversationsReducer,
  bindedConversations: bindedConversationsReducer,
  phoneContacts: phoneContactsReducer,
});
