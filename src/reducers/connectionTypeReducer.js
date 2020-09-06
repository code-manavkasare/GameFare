import {SET_CONNECTION_TYPE} from '../actions/types';

const initialState = {
  type: 'unknown',
};

const connectionTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONNECTION_TYPE:
      return {type: action.connectionType};
    default:
      return state;
  }
};

export default connectionTypeReducer;
