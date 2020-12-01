import {dissoc} from 'ramda';

import {SET_BOOKINGS, DELETE_BOOKINGS, RESET_BOOKINGS} from '../types';

const initialState = {};

const bookingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_BOOKINGS:
      return {...state, ...action.bookings};
    case DELETE_BOOKINGS:
      const {bookingsIDs} = action;
      return bookingsIDs.reduce((newState, id) => dissoc(id, newState), state);
    case RESET_BOOKINGS:
      return initialState;
    default:
      return state;
  }
};

export {bookingsReducer};
