import {SET_CONVERSATION} from '../actions/types';

const initialState = {
  gamefareUser: {
    _id: 'dfjkfgdgkfkgkdjfgjkdf',
    name: 'GameFare',
    avatar:
      'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/logos%2Flogoios.png?alt=media&token=536ba87c-20e7-4be9-848e-86d8e7d21f2c',
  },
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONVERSATION:
      return {
        ...state,
        [action.conversationID]: {
          ...state[action.conversationID],
          messages: action.messages,
        },
      };
    default:
      return state;
  }
};

export default messageReducer;
