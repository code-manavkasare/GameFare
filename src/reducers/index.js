import {combineReducers} from 'redux';
import globaleVariablesReducer from './globaleVariablesReducer';
import userReducer from './userReducer';
import historicSearchReducer from './historicSearchReducer';
import createEventReducer from './createEventReducer';
import createChallengeReducer from './createChallengeReducer';
import eventsReducer from './eventsReducer';
import createGroupReducer from './createGroupReducer';
import groupsReducer from './groupsReducer';
import messageReducer from './messageReducer';

export default combineReducers({
  globaleVariables: globaleVariablesReducer,
  user: userReducer,
  historicSearch: historicSearchReducer,
  createEventData: createEventReducer,
  createChallengeData: createChallengeReducer,
  events: eventsReducer,
  groups: groupsReducer,
  createGroup: createGroupReducer,
  message: messageReducer,
});
