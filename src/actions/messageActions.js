import {
  SET_CONVERSATION,
  SET_CONVERSATIONS,
  SET_INPUT,
  ADD_IMAGE,
} from './types';
import {loadMyDiscusions} from '../components/functions/message';

const setConversation = (value) => ({
  type: SET_CONVERSATION,
  conversation: value,
});

const setConversations = (value) => ({
  type: SET_CONVERSATIONS,
  conversations: value,
});

const setInput = (value) => ({
  type: SET_INPUT,
  input: value,
});

const addImage = (value) => ({
  type: ADD_IMAGE,
  image: value,
});

export const messageAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setConversation') {
      await dispatch(setConversation(data));
    } else if (val === 'setConversations') {
      await dispatch(setConversations(data));
    } else if (val === 'loadConversations') {
      const discussions = await loadMyDiscusions(data.userID);
      await dispatch(setConversations(discussions));
    } else if (val === 'setInput') {
      await dispatch(setInput(data));
    } else if (val === 'addImage') {
      await dispatch(addImage(data));
    }
    return true;
  };
};
