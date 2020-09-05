import {SET_LAYOUT, SET_GENERAL_SESSION_RECORDING} from './types';

export const setLayout = (value) => ({
  type: SET_LAYOUT,
  value,
});

export const setGeneralSessionRecording = (value) => ({
  type: SET_GENERAL_SESSION_RECORDING,
  value,
});

export const layoutAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setLayout') {
      await dispatch(setLayout(data));
    } else if (val === 'setGeneralSessionRecording') {
      await dispatch(setGeneralSessionRecording(data));
    }
    return true;
  };
};
