import {dissoc} from 'ramda';

import {RESET_CONVERSATIONS, SET_CONVERSATION} from '../actions/types';

const initialState = {};

const conversationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONVERSATION:
      console.log('SET_CONVERSATION', action);
      const {conversation} = action;
      // let currentConversation = state[conversation.objectID];
      // if (!currentConversation) currentConversation = {};
      // console.log('currentConversation', currentConversation);
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

export default conversationsReducer;
