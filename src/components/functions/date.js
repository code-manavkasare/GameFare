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
  if (min === 0) return seconds(value) + ' sec';
  return minutes(value) + ' min ' + seconds(value) + ' sec';
};

const formatDate = (date) => {
  let justNow = moment(Date.now()).subtract(1, 'minute');
  let earlier = moment(Date.now()).subtract(7, 'days');
  let lastYear = moment(Date.now()).subtract(1, 'year');
  if (date > justNow) return 'Just now';
  else if (date > earlier) return moment(date).fromNow();
  else if (date > lastYear) return moment(date).format('ddd, MMM DD');
  else return moment(date).format('MMMM YYYY');
}

const formatDuration = (duration) => {
  if (duration > 60)
    return Math.round(duration / 60).toString() + ' minute' + ((Math.round(duration/60) !== 1) ? 's' : '') + ' long';
  else return Math.round(duration).toString() + ' second' + ((Math.round(duration) !== 1) ? 's' : '') + ' long';
}

module.exports = {getPermissionCalendar, isDatePast, duration, formatDate, formatDuration};
