import {SET_VARIABLES, SET_FIREBASE_BINDINGS_STATE} from '../types';

const setVariables = (value) => ({
  type: SET_VARIABLES,
  value: value,
});

const setFirebaseBindingsState = (value) => ({
  type: SET_FIREBASE_BINDINGS_STATE,
  value,
});

export const globaleVariablesAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setVariables') {
      await dispatch(setVariables(data));
    } else if (val === 'setFirebaseBindingsState') {
      await dispatch(setFirebaseBindingsState(data));
    }
    return true;
  };
};
