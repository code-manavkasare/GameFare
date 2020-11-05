import {POPULATE_PHONE_CONTACTS} from '../types';

export const populatePhoneContacts = (value) => ({
  type: POPULATE_PHONE_CONTACTS,
  value,
});

export const phoneContactsAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'populatePhoneContacts') {
      await dispatch(populatePhoneContacts(data));
    }
    return true;
  };
};
