import {
  RESET_CONVERSATIONS,
  SET_CONVERSATION,
  BIND_CONVERSATION,
  UNBIND_CONVERSATION,
} from '../actions/types';

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
    case BIND_CONVERSATION: {
      const {conversationID} = action;
      if (conversationID) {
        const bindCount = state[conversationID];
        if (bindCount) {
          return {...state, [conversationID]: bindCount + 1};
        }
        return {...state, [conversationID]: 1};
      }
      return state;
    }
    case UNBIND_CONVERSATION: {
      const {conversationID} = action;
      if (conversationID) {
        const bindCount = state[conversationID];
        if (bindCount) {
          return {...state, [conversationID]: bindCount === 0 ? 0 : bindCount - 1};
        }
        return {...state, [conversationID]: 0};
      }
      return state;
    }
    default:
      return state;
  }
};

export {conversationsReducer, bindedConversationsReducer};
