import {SET_CONVERSATION, SET_CONVERSATIONS} from '../actions/types';

const initialState = {
  gamefareUser: {
    _id: 'dfjkfgdgkfkgkdjfgjkdf',
    name: 'GameFare',
    avatar:
      'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/logos%2Flogoios.png?alt=media&token=536ba87c-20e7-4be9-848e-86d8e7d21f2c',
  },
  conversations: {},
  messages: {},
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONVERSATIONS:
      return {
        ...state,
        ...action.conversations,
      };
    case SET_CONVERSATION:
      console.log('SET_CONVERSATION', action.conversation);
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [action.conversation.objectID]: {
            ...state[action.conversation.objectID],
            ...action.conversation,
          },
        },
      };
    default:
      return state;
  }
};

export default messageReducer;
