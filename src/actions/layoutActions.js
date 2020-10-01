import {
  SET_LAYOUT,
  SET_GENERAL_SESSION_RECORDING,
  SET_CAMERA_AVAILABILITY,
} from './types';

export const setLayout = (value) => ({
  type: SET_LAYOUT,
  value,
});

export const setGeneralSessionRecording = (value) => ({
  type: SET_GENERAL_SESSION_RECORDING,
  value,
});

export const setCameraAvailability = (value) => ({
  type: SET_CAMERA_AVAILABILITY,
  value,
});

export const layoutAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setLayout') {
      await dispatch(setLayout(data));
    } else if (val === 'setGeneralSessionRecording') {
      await dispatch(setGeneralSessionRecording(data));
    } else if (val === 'setCameraAvailability') {
      await dispatch(setCameraAvailability(data));
    }
    return true;
  };
};
