import {SET_CONNECTION_TYPE} from '../actions/types';

const initialState = {
  type: 'unknown',
};

const connectionTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONNECTION_TYPE:
      console.log('set connection type', action.connectionType);
      return {type: action.connectionType};
    default:
      return state;
  }
};

export default connectionTypeReducer;
