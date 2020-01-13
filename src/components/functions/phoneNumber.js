import {
  AsYouType,
  parsePhoneNumberFromString,
  isValidNumber,
  getExampleNumber,
} from 'libphonenumber-js';

import examples from 'libphonenumber-js/examples.mobile.json';

function formatNumber(countryCode, val, countryDigit, previousVal) {
  const phoneNumber = parsePhoneNumberFromString(
    '+' + countryDigit + ' ' + val,
  );
  const oldPhoneNumber = parsePhoneNumberFromString(
    '+' + countryDigit + ' ' + previousVal,
  );
  var format = new AsYouType(countryCode).input(val);

  if (!phoneNumber || !oldPhoneNumber) return format;
  if (phoneNumber.nationalNumber === oldPhoneNumber.nationalNumber) {
    return val;
  }
  return format;
}

function isValidNumberCheck(countryCode, phone) {
  return isValidNumber(phone, countryCode);
}

function placeholder(country, countryCode) {
  const phoneNumber = getExampleNumber(country, examples);
  return new AsYouType(country).input(phoneNumber.nationalNumber);
}

export {formatNumber, isValidNumberCheck, placeholder};
