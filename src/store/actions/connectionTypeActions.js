import {SET_CONNECTION_TYPE} from '../types';

const setConnectionType = (connectionType) => ({
  type: SET_CONNECTION_TYPE,
  connectionType,
});

export const connectionTypeAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setConnectionType') {
      await dispatch(setConnectionType(data));
    }
    return true;
  };
};
