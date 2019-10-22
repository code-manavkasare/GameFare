import {
    SET_VARIABLES
} from '../actions/types';

const initialState = {
    tabs:{
        home:{}
    }
}

const globaleVariablesReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_VARIABLES:
            return action.value;
        default:
            return state;
    }
}

export default globaleVariablesReducer;