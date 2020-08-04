import {SET_CONVERSATION} from './types';

const setConversation = (value) => ({
  type: SET_CONVERSATION,
  conversation: value,
});

module.exports = {setConversation};
