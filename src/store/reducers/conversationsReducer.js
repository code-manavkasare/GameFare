import {
  RESET_BINDS_CONVERSATIONS,
  RESET_CONVERSATIONS,
  SET_CONVERSATION,
  SET_CONVERSATION_BINDED,
} from '../types';

const initialState = {};

const conversationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONVERSATION:
      const {conversation} = action;
      return {
        ...state,
        [conversation.objectID]: conversation.messages,
      };
    case RESET_BINDS_CONVERSATIONS:
      return Object.values(state).reduce(function(result, item) {
        result[item.id] = {...item, isBinded: false};
        return result;
      }, {});
    case RESET_CONVERSATIONS:
      return initialState;
    default:
      return state;
  }
};

export {conversationsReducer};
