import {
  RESET_CONVERSATIONS,
  SET_CONVERSATION,
  SET_CONVERSATION_BINDED,
} from '../types';

const initialState = {};
const initialStateBind = {};

const conversationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONVERSATION:
      const {conversation} = action;
      return {
        ...state,
        [conversation.objectID]: conversation.messages,
      };
    case RESET_CONVERSATIONS:
      return initialState;
    default:
      return state;
  }
};

const bindedConversationsReducer = (state = initialStateBind, action) => {
  switch (action.type) {
    case SET_CONVERSATION_BINDED:
      const {objectID, value} = action;
      return {...state, [objectID]: value};
    default:
      return state;
  }
};

export {conversationsReducer, bindedConversationsReducer};
