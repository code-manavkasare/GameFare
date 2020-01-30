import {
  SET_CONVERSATION,
  SET_CONVERSATIONS,
  SET_INPUT,
  ADD_IMAGE,
  RESET_USER_MESSAGES,
  SET_MY_CONVERSATION,
} from '../actions/types';
import union from 'lodash/union';

export const initialState = {
  gamefareUser: {
    _id: 'dfjkfgdgkfkgkdjfgjkdf',
    name: 'GameFare',
    avatar:
      'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/logos%2Flogoios.png?alt=media&token=536ba87c-20e7-4be9-848e-86d8e7d21f2c',
  },
  conversations: {},
  myDiscussions: {},
  messages: {},
  input: {
    textInput: '',
    images: [],
  },
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONVERSATIONS:
      return {
        ...state,
        conversations: {
          ...action.conversations,
        },
      };
    case ADD_IMAGE:
      return {
        ...state,
        input: {
          ...state.input,
          images: union([action.image], state.input.images),
        },
      };
    case SET_INPUT:
      return {
        ...state,
        input: {
          ...state.input,
          ...action.input,
        },
      };
    case SET_CONVERSATION:
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
    case SET_MY_CONVERSATION:
      return {...state,myDiscussions:{
        ...state.myDiscussions,
        ...action.myDiscussions
      }}
    case RESET_USER_MESSAGES:
      return initialState;
    default:
      return state;
  }
};

export default messageReducer;
