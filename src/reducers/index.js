import {combineReducers} from 'redux';
import globaleVariablesReducer from './globaleVariablesReducer'

export default combineReducers({
    globaleVariables :globaleVariablesReducer,
});