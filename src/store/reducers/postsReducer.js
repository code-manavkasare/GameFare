import {dissoc} from 'ramda';

import {SET_POSTS, DELETE_POSTS, RESET_POSTS} from '../types';

const initialState = {};

const postsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_POSTS:
      return {...state, ...action.posts};
    case DELETE_POSTS:
      const {postsIDs} = action;
      return postsIDs.reduce((newState, id) => dissoc(id, newState), state);
    case RESET_POSTS:
      return initialState;
    default:
      return state;
  }
};

export {postsReducer};
