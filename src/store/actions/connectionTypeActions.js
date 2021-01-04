import {SET_CONNECTION_TYPE} from '../types';

export const setConnectionType = (connectionData) => ({
  type: SET_CONNECTION_TYPE,
  connectionData,
});

export const connectionTypeAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setConnectionType') {
      await dispatch(setConnectionType(data));
    }
    return true;
  };
};
