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
import coachReducer from './coachReducer';

export default combineReducers({
  globaleVariables: globaleVariablesReducer,
  user: userReducer,
  coach: coachReducer,
  historicSearch: historicSearchReducer,
  createEventData: createEventReducer,
  createChallengeData: createChallengeReducer,
  events: eventsReducer,
  groups: groupsReducer,
  createGroup: createGroupReducer,
  message: messageReducer,
});
