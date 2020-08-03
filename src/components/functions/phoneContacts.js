import Contacts from 'react-native-contacts';
import {parsePhoneNumberFromString} from 'libphonenumber-js/mobile';
import {store} from '../../../reduxStore';
import {populatePhoneContacts} from '../../actions/phoneContactsActions';

function getMobileNumber(contact) {
  // contact param is react-native-contacts data
  const {phoneNumbers} = contact;
  let likelyMobileNumber = phoneNumbers[0];
  if (phoneNumbers.length > 1) {
    mobileNumbers = phoneNumbers.filter((num) => num.label === 'mobile');
    iphoneNumbers = phoneNumbers.filter((num) => num.label === 'iPhone');
    if (mobileNumbers.length > 0) {
      likelyMobileNumber = mobileNumbers[0];
    } else if (iphoneNumbers.length > 0) {
      likelyMobileNumber = iphoneNumbers[0];
    }
  }
  return likelyMobileNumber.number;
}

function makeContact(contact, defaultCountryCode) {
  // makes a simpler contact object from the react-native-contacts data
  // { id, firstname, lastname, picture, phoneNumber, countryCode }
  let mobileNumber = getMobileNumber(contact);
  if (mobileNumber[0] !== '+') {
    mobileNumber = `${defaultCountryCode} ${mobileNumber}`;
  }
  let parsedNumber = parsePhoneNumberFromString(mobileNumber);
  if (parsedNumber) {
    return {
      id: contact.recordID,
      firstname: contact.givenName,
      lastname: contact.familyName,
      picture: contact.thumbnailPath,
      phoneNumber: parsedNumber.nationalNumber,
      countryCode: parsedNumber.countryCallingCode,
    };  
  } else {
    return null;
  }
}

function refreshPhoneContactsStore() {
  Contacts.getAll((err, contacts) => {
    if (!err) {
      const userCountryCode = store.getState().user.infoUser.userInfo.countryCode;
      filteredContacts = contacts
        .filter((contact) => contact.phoneNumbers.length !== 0)
        .map((contact) => makeContact(contact, userCountryCode))
        .filter((x) => x); // filters out null from makeContact
      store.dispatch(populatePhoneContacts(filteredContacts));
    }
  });
}

function searchPhoneContacts(search) {
  const contacts = store.getState().phoneContacts.contacts;
  if (search === '' || !search) {
    return contacts;
  } else {
    return contacts.filter((contact) =>
      contact.firstname.toLowerCase()
        .search(search.toLowerCase()) !== -1 ||
      contact.lastname.toLowerCase()
        .search(search.toLowerCase()) !== -1
    );
  }
}

module.exports = {refreshPhoneContactsStore, searchPhoneContacts};