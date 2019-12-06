import {
    SET_FUTURE_USER_EVENTS,
    SET_PAST_USER_EVENTS,
    SET_ALL_USER_EVENTS,
    SET_ALL_EVENTS,
    ADD_FUTURE_EVENT,
    SET_PUBLIC_EVENTS
} from '../actions/types';

import union from 'lodash/union'

const initialState = {
    futureUserEvents:[],
    pastUserEvents:[],
    publicEvents:[],
    allEvents:{}
}

const eventsReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_ALL_EVENTS:
            return {...state,allEvents:{...state.allEvents,...action.events}};
        case SET_FUTURE_USER_EVENTS:
            return {...state,futureUserEvents:action.futureUserEvents};
        case SET_PUBLIC_EVENTS:
                return {...state,publicEvents:action.publicEvents};
        case SET_PAST_USER_EVENTS:
            return {...state,pastUserEvents:action.pastUserEvents};
        case ADD_FUTURE_EVENT:
            return {...state,futureUserEvents:union([action.eventID],state.futureUserEvents)};
        default:
            return state;
    }
}

export default eventsReducer;