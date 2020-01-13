import React, {Component} from 'react';
import {Platform, PermissionsAndroid, Dimensions} from 'react-native';

import {request, PERMISSIONS} from 'react-native-permissions';

async function getPermissionCalendar() {
  if (Platform.OS === 'ios') {
    var permission = await request(PERMISSIONS.IOS.CALENDARS);
  } else {
    var permission = await request(PERMISSIONS.ANDROID.WRITE_CALENDAR);
  }
  if (permission !== 'granted') return false;
  return true;
}

module.exports = {getPermissionCalendar};
