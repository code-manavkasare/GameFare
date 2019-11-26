import {
    SET_FUTURE_USER_EVENTS,
    SET_PAST_USER_EVENTS,
    SET_ALL_USER_EVENTS
  } from './types';
  
  const setFutureUserEvents = (value) => ({
    type: SET_FUTURE_USER_EVENTS,
    futureUserEvents:value
  }); 

  const setPastUserEvents = (value) => ({
    type: SET_PAST_USER_EVENTS,
    pastUserEvents:value
  }); 

  const setAllUserEvents = (value) => ({
    type: SET_ALL_USER_EVENTS,
    futureUserEvents:value.futureEvents,
    pastUserEvents:value.pastEvents
  }); 

  
  export const eventsAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'setFutureUserEvents') {
        await dispatch(setFutureUserEvents(data))
      } else if (val == 'setPastUserEvents') {
        await dispatch(setPastUserEvents(data))
      } else if (val == 'setAllUserEvents') {
        await dispatch(setAllUserEvents(data))
      }
      
      return true
    }
  }
  