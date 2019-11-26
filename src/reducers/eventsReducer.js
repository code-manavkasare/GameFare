import {
    SET_FUTURE_USER_EVENTS,
    SET_PAST_USER_EVENTS,
    SET_ALL_USER_EVENTS
} from '../actions/types';

const initialState = {
    futureUserEvents:{},
    pastUserEvents:{}
}

const eventsReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_FUTURE_USER_EVENTS:
            return {...state,futureUserEvents:action.futureUserEvents};
        case SET_PAST_USER_EVENTS:
            return {...state,pastUserEvents:action.pastUserEvents};
        case SET_ALL_USER_EVENTS:
            return {...state,pastUserEvents:action.pastUserEvents,futureUserEvents:action.futureUserEvents};
        default:
            return state;
    }
}

export default eventsReducer;