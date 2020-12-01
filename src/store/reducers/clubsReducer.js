import {dissoc} from 'ramda';

import {SET_CLUBS,SET_CLUB, DELETE_CLUBS, RESET_CLUBS} from '../types';

const initialState = {};

const clubsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CLUBS:
      return {...state, ...action.clubs};
    case SET_CLUB:
      const {club} = action;
      return {...state, [club.id]: {...state[club.id], ...club}};
    case DELETE_CLUBS:
      const {clubsIDs} = action;
      return clubsIDs.reduce((newState, id) => dissoc(id, newState), state);
    case RESET_CLUBS:
      return initialState;
    default:
      return state;
  }
};

export {clubsReducer};
