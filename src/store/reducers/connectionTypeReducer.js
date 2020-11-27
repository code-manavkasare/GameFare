import {SET_CONNECTION_TYPE} from '../types';

const initialState = {
  type: 'unknown',
};

const connectionTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONNECTION_TYPE:
      return {...state, ...action.connectionData};
    default:
      return state;
  }
};

export default connectionTypeReducer;
