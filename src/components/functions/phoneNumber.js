import {
  AsYouType,
  parsePhoneNumberFromString,
  isValidNumber,
  getExampleNumber,
} from 'libphonenumber-js';

import examples from 'libphonenumber-js/examples.mobile.json';

function formatNumber(countryCode, val, countryDigit, previousVal) {
  console.log('formatNumber');
  console.log(val);
  console.log(previousVal);
  const phoneNumber = parsePhoneNumberFromString(
    '+' + countryDigit + ' ' + val,
  );
  const oldPhoneNumber = parsePhoneNumberFromString(
    '+' + countryDigit + ' ' + previousVal,
  );
  console.log(phoneNumber);
  console.log(oldPhoneNumber);
  var format = new AsYouType(countryCode).input(val);

  if (!phoneNumber || !oldPhoneNumber) return format;
  console.log('ici', previousVal);
  console.log(phoneNumber.nationalNumber);
  console.log(oldPhoneNumber.nationalNumber);
  if (phoneNumber.nationalNumber === oldPhoneNumber.nationalNumber) {
    console.log('on est laaaaa');
    return val;
  }
  console.log(format);
  return format;
}

function isValidNumberCheck(countryCode, phone) {
  console.log('isValidNumberCheck');
  console.log(countryCode);
  console.log(phone);
  return isValidNumber(phone, countryCode);
}

function placeholder(country, countryCode) {
  const phoneNumber = getExampleNumber(country, examples);
  return new AsYouType(country).input(phoneNumber.nationalNumber);
}

export {formatNumber, isValidNumberCheck, placeholder};
