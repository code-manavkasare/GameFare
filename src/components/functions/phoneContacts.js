import Contacts from 'react-native-contacts';

function getPhoneContacts() {
  Contacts.getAll((err, contacts) => {
    if (err) {
      throw err
    } else {
      return contacts
      .filter((contact) => contact.phoneNumbers.length !== 0)
      .map((contact, i) => {
        return {
          id: contact.recordID,
          index: i,
          firstname: contact.givenName,
          lastname: contact.familyName,
          phoneNumber: contact.phoneNumbers[0].number, // make sure we are getting the cellphone here
        };
      })
      .sort((a, b) => {
        let textA = a.lastname.toUpperCase();
        let textB = b.lastname.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
    }
  }
}


module.exports = {getPhoneContacts};