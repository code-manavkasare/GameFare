import {
    SET_LOCATION_SEARCH
} from '../actions/types';

const initialState = {
    searchLocation:{}
}

const historicSearchReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_LOCATION_SEARCH:
            return {...state,searchLocation:action.searchLocation};
        default:
            return state;
    }
}

export default historicSearchReducer;