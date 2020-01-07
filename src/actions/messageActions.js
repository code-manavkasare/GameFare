import {SET_CONVERSATION, SET_CONVERSATIONS} from './types';

const setConversation = (value) => ({
  type: SET_CONVERSATION,
  conversation: value,
});

export const messageAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setConversation') {
      console.log('setConversation', data);
      await dispatch(setConversation(data));
    } else if (val === 'setConversations') {
      await dispatch(setConversation(data));
    }
    return true;
  };
};
