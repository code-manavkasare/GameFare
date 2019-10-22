import {combineReducers} from 'redux';
import globaleVariablesReducer from './globaleVariablesReducer'
import userReducer from './userReducer';

export default combineReducers({
    globaleVariables:globaleVariablesReducer,
    user:userReducer
});