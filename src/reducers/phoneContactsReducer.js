import {POPULATE_PHONE_CONTACTS} from '../actions/types';

const initialState = {
  contacts: [],
};

const phoneContactsReducer = (state = initialState, action) => {
  switch (action.type) {
    case POPULATE_PHONE_CONTACTS:
      return {
        contacts: action.value,
      };
    default:
      return state;
  }
};

export default phoneContactsReducer;
