import {
  SET_CONVERSATION
  } from './types';
  
  const setConversation = (value) => ({
    type: SET_CONVERSATION,
    conversationID:value.conversationID,
    messages:value.messages
  }); 

  
  export const messageAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'setConversation') {
        await dispatch(setConversation(data))
      }
      return true
    }
  }
  