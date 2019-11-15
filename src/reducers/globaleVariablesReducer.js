import {
    SET_VARIABLES
} from '../actions/types';

const initialState = {
    tabs:{
        home:{}
    },
    sports:{
        list:[]
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