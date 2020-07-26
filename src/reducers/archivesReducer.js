import {SET_ARCHIVE} from '../actions/types';

const initialState = {
  archives: {},
};

const archivesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ARCHIVE:
      console.log('actionSetArchive', action);
      const {archive} = action;
      return {...state, [archive.id]: archive};
    default:
      return state;
  }
};

export default archivesReducer;
