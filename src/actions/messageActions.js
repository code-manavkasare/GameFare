import {
  SET_CONVERSATIONS,
  SET_INPUT,
  ADD_IMAGE,
  DELETE_MY_CONVERSATION,
} from './types';
import {loadMyDiscusions} from '../components/functions/message';

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

const deleteMyConversation = (value) => ({
  type: DELETE_MY_CONVERSATION,
  objectID: value,
});

export const messageAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setConversations') {
      await dispatch(setConversations(data));
    } else if (val === 'loadConversations') {
      const discussions = await loadMyDiscusions(data.userID);
      await dispatch(setConversations(discussions));
    } else if (val === 'setInput') {
      await dispatch(setInput(data));
    } else if (val === 'addImage') {
      await dispatch(addImage(data));
    } else if (val === 'deleteMyConversation') {
      await dispatch(deleteMyConversation(data));
    }
    return true;
  };
};
