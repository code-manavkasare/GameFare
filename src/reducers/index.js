import {combineReducers} from 'redux';
import globaleVariablesReducer from './globaleVariablesReducer'
import userReducer from './userReducer';
import historicSearchReducer from './historicSearchReducer'
import createEventReducer from './createEventReducer';
import eventsReducer from './eventsReducer'

export default combineReducers({
    globaleVariables:globaleVariablesReducer,
    user:userReducer,
    historicSearch:historicSearchReducer,
    createEventData:createEventReducer,
    events:eventsReducer,
});