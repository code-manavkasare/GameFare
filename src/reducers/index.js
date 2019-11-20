import {combineReducers} from 'redux';
import globaleVariablesReducer from './globaleVariablesReducer'
import userReducer from './userReducer';
import historicSearchReducer from './historicSearchReducer'

export default combineReducers({
    globaleVariables:globaleVariablesReducer,
    user:userReducer,
    historicSearch:historicSearchReducer
});