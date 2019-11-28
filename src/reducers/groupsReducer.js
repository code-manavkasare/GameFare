import {
    SET_MYGROUPS,
} from '../actions/types';

const initialState = {
    mygroups:{}
}

const eventsReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_MYGROUPS:
            return {...state,mygroups:action.mygroups};
        default:
            return state;
    }
}

export default eventsReducer;