import {SET_CONVERSATION, SET_CONVERSATION_BINDED} from './types';

const setConversation = (value) => ({
  type: SET_CONVERSATION,
  conversation: value,
});

const setConversationBinded = (value) => ({
  type: SET_CONVERSATION_BINDED,
  conversation: value,
});

module.exports = {setConversation, setConversationBinded};
