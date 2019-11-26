import React, { Component } from 'react';
import {
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoder';
import {request, PERMISSIONS} from 'react-native-permissions';

const options = { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }


async function getPermission () {
    if (Platform.OS == 'ios') {
        var permission = await request(PERMISSIONS.IOS.LOCATION_ALWAYS)
        if (permission != 'granted') {
            permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        }
    } else {
        var permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
    }
    console.log('permission')
    console.log(permission)
    if (permission != 'granted') return false
    return true
}

async function getCurrentPosition () {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, ({code, message}) =>
          reject(Object.assign(new Error(message), {name: "PositionError", code,message:message,response:false,})),
          options);
    })
}

async function currentLocation() {
    var permission = await getPermission()
    if (!permission) return {message:"We don't have access to your location. Please go to your settings and set it.",response:false,}
    var currentPosition = await getCurrentPosition()
    if (currentPosition.name == 'PositionError') return currentPosition
    var geocodeLocation = await Geocoder.geocodePosition({
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude
    })
    console.log('currentPosition')
    console.log(currentPosition)
    console.log(geocodeLocation)
    return  {
        address:geocodeLocation[0].formattedAddress,
        area:geocodeLocation[0].formattedAddress,
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude
    }
}

function getZone(rawAddress) {
    var address =rawAddress.replace(', USA','')
    address =address.replace(', Canada','')
    return address.split(',')[address.split(',').length-2]+',' + address.split(',')[address.split(',').length-1]
}
  
  
module.exports = {currentLocation,getZone};