import { TOGGLE_BATTERY_SAVER } from '../actions/types';

const initialState = {
  batterySaver: false,
};

const appSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_BATTERY_SAVER:
      return {...state, batterySaver: !state.batterySaver};
    default:
      return state;
  }
};

export default appSettingsReducer;
