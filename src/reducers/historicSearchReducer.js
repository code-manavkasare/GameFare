import {
    SET_LOCATION_SEARCH,
    SET_HISTORIC_LOCATION_SEARCH,
    SET_SPORT
} from '../actions/types';

const initialState = {
    historicSearchLocation:{},
    searchLocation:{
        address:'Los Angeles, California',
        lat:34.052235,
        lng:-118.243683
    },
    sport:'',
}

const historicSearchReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_HISTORIC_LOCATION_SEARCH:
            return {...state,historicSearchLocation:action.historicSearchLocation};
        case SET_LOCATION_SEARCH:
                return {...state,searchLocation:action.searchLocation};
        case SET_SPORT:
            return {...state,sport:action.sport};
        default:
            return state;
    }
}

export default historicSearchReducer;