import {
  SET_CONVERSATION,
  BIND_CONVERSATION,
  UNBIND_CONVERSATION,
  SET_CONVERSATION_BINDED,
  RESET_BINDS_CONVERSATIONS,
} from '../types';

const setConversation = (value) => ({
  type: SET_CONVERSATION,
  conversation: value,
});

const setConversationBinded = (objectID, value) => ({
  type: SET_CONVERSATION_BINDED,
  objectID,
  value,
});

const resetBindsConversations = () => ({
  type: RESET_BINDS_CONVERSATIONS,
});

const bindConversation = (conversationID) => ({
  type: BIND_CONVERSATION,
  conversationID,
});

const unbindConversation = (conversationID) => ({
  type: UNBIND_CONVERSATION,
  conversationID,
});

const conversationsAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setConversation') {
      await dispatch(setConversation(data));
    } else if (val === 'bindConversation') {
      await dispatch(bindConversation(data));
    } else if (val === 'unbindConversation') {
      await dispatch(unbindConversation(data));
    }
    return true;
  };
};

export {
  conversationsAction,
  setConversation,
  bindConversation,
  unbindConversation,
  resetBindsConversations,
  setConversationBinded,
};
