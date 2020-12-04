import {SET_USERS, RESET_USERS} from '../types';

const initialState = {};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USERS:
      return {...state, ...action.users};
    case RESET_USERS:
      return initialState;
    default:
      return state;
  }
};

export {usersReducer};
