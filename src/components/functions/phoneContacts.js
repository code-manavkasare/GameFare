import Contacts from 'react-native-contacts';
const userCountryCode = '1';

function makeContact(contact) {
  // makes a simpler contact object from the react-native-contacts data
  // { id, firstname, lastname, picture, phoneNumber, countryCode }
  const {phoneNumbers} = contact;
  let countryCode = userCountryCode;
  // get mobile phone number
  let phoneNumber = phoneNumbers[0];
  if (phoneNumbers.length > 1) {
    mobileNumbers = phoneNumbers.filter((num) => num.label === 'mobile');
    iphoneNumbers = phoneNumbers.filter((num) => num.label === 'iPhone');
    if (mobileNumbers.length > 0) {
      phoneNumber = mobileNumbers[0];
    } else if (iphoneNumbers.length > 0) {
      phoneNumber = iphoneNumbers[0];
    }
  }
  return {
    id: contact.recordID,
    firstname: contact.givenName,
    lastname: contact.familyName,
    picture: contact.thumbnailPath,
    phoneNumber: contact.phoneNumbers[0].number, // make sure we are getting the cellphone here
    countryCode: countryCode,
  };
}

function getPhoneContacts() {
  let filteredContacts = [];
  Contacts.getAll((err, contacts) => {
    if (err) {
      throw err
    } else {
      filteredContacts = contacts
        .filter((contact) => contact.phoneNumbers.length !== 0)
        .map((contact) => makeContact(contact));
        // .sort((a, b) => {
        //   let textA = a.lastname.toUpperCase();
        //   let textB = b.lastname.toUpperCase();
        //   return textA < textB ? -1 : textA > textB ? 1 : 0;
        // });
    }
  });
  return filteredContacts;
}


module.exports = {getPhoneContacts};