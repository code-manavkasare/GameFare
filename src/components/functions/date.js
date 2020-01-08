import React, { Component } from 'react';
import {
  Platform,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
const { height, width } = Dimensions.get('screen')

import {request, PERMISSIONS} from 'react-native-permissions';

async function getPermissionCalendar () {
    if (Platform.OS == 'ios') {
        var permission = await request(PERMISSIONS.IOS.CALENDARS)
    } else {
        var permission = await request(PERMISSIONS.ANDROID.WRITE_CALENDAR)
    }
    console.log('permission')
    console.log(permission)
    if (permission != 'granted') return false
    return true
}

  
module.exports = {getPermissionCalendar};