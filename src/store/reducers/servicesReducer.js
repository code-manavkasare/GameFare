import {dissoc} from 'ramda';

import {SET_SERVICES, DELETE_SERVICES, RESET_SERVICES} from '../types';

const initialState = {};

const servicesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SERVICES:
      return {...state, ...action.services};
    case DELETE_SERVICES:
      const {servicesIDs} = action;
      return servicesIDs.reduce((newState, id) => dissoc(id, newState), state);
    case RESET_SERVICES:
      return initialState;
    default:
      return state;
  }
};

export {servicesReducer};
