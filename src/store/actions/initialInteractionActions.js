import {SET_INITIAL_INTERACTION} from '../types';

export const setInitialInteraction = (value) => ({
  type: SET_INITIAL_INTERACTION,
  value,
});
export const initialInteractionAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setInitialInteraction') {
      await dispatch(setInitialInteraction(data));
    }
    return true;
  };
};
