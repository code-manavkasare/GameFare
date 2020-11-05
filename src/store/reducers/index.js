import {combineReducers} from 'redux';
import {reducer as network} from 'react-native-offline';

import globaleVariablesReducer from './globaleVariablesReducer';
import userReducer from './userReducer';
import historicSearchReducer from './historicSearchReducer';
import messageReducer from './messageReducer';
import coachReducer from './coachReducer';
import layoutReducer from './layoutReducer';
import uploadQueueReducer from './uploadQueueReducer';
import appSettingsReducer from './appSettingsReducer';
import localVideoLibraryReducer from './localVideoLibraryReducer';
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
  globaleVariables: globaleVariablesReducer,
  historicSearch: historicSearchReducer,
  layout: layoutReducer,
  localVideoLibrary: localVideoLibraryReducer,
  message: messageReducer,
  network,
  phoneContacts: phoneContactsReducer,
  uploadQueue: uploadQueueReducer,
  user: userReducer,
});
