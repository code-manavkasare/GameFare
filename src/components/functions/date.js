import React, {Component} from 'react';
import {Platform, PermissionsAndroid, Dimensions} from 'react-native';
import moment from 'moment';
import {request, PERMISSIONS} from 'react-native-permissions';

import {seconds, minutes} from './coach';

async function getPermissionCalendar() {
  if (Platform.OS === 'ios') {
    var permission = await request(PERMISSIONS.IOS.CALENDARS);
  } else {
    var permission = await request(PERMISSIONS.ANDROID.WRITE_CALENDAR);
  }
  if (permission !== 'granted') return false;
  return true;
}

function isDatePast(date) {
  return moment().valueOf() > moment(date).valueOf();
}

const duration = (value) => {
  const min = minutes(value);
  console.log('min', min);
  if (min === 0) return seconds(value) + 'sec';
  return minutes(value) + 'min' + seconds(value) + 'sec';
};

module.exports = {getPermissionCalendar, isDatePast, duration};
