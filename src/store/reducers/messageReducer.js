import {
  SET_CONVERSATION,
  SET_CONVERSATIONS,
  SET_INPUT,
  ADD_IMAGE,
  RESET_USER_MESSAGES,
  DELETE_MY_CONVERSATION,
} from '../types';
import union from 'lodash/union';

export const initialState = {
  gamefareUser: {
    id: 'dfjkfgdgkfkgkdjfgjkdf',
    info: {
      firstname: 'GameFare',
      lastname: '',
      noProfileClick: true,
      picture:
        'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/logos%2Flogoios.png?alt=media&token=536ba87c-20e7-4be9-848e-86d8e7d21f2c',
    },
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
    case DELETE_MY_CONVERSATION:
      let test = Object.keys(state.myDiscussions).filter(
        (discussion) => discussion !== action.objectID,
      );
      test = test.reduce(function(result, item) {
        result[item] = true;
        return result;
      }, {});
      return {...state, myDiscussions: test};
    case RESET_USER_MESSAGES:
      return initialState;
    default:
      return state;
  }
};

export default messageReducer;
