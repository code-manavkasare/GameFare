import {
    SET_FUTURE_USER_EVENTS,
    SET_PAST_USER_EVENTS,
    SET_ALL_USER_EVENTS,
    SET_ALL_EVENTS,
    ADD_FUTURE_EVENT
  } from './types';

  const setAllEvents = (value) => ({
    type: SET_ALL_EVENTS,
    events:value
  }); 
  
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

  const addFutureEvent = (value) => ({
    type: ADD_FUTURE_EVENT,
    eventID:value
  }); 

  

  
  export const eventsAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'setFutureUserEvents') {
        await dispatch(setFutureUserEvents(data))
      } else if (val == 'setPastUserEvents') {
        await dispatch(setPastUserEvents(data))
      } else if (val == 'setAllUserEvents') {
        await dispatch(setAllUserEvents(data))
      } else if (val == 'setAllEvents') {
        await dispatch(setAllEvents(data))
      } else if (val == 'addFutureEvent') {
        await dispatch(addFutureEvent(data))
      }
      
      return true
    }
  }
  