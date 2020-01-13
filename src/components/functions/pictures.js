import React, {Component} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';

import firebase from 'react-native-firebase';
import CameraRoll from '@react-native-community/cameraroll';

import {request, PERMISSIONS} from 'react-native-permissions';
import ImagePicker from 'react-native-image-picker';
import RNVideoHelper from 'react-native-video-helper';

import ImageResizer from 'react-native-image-resizer';

const options = {
  quality: 1.0,
  storageOptions: {
    skipBackup: true,
  },
};

async function permission(type) {
  if (type === 'camera') {
    if (Platform.OS === 'ios') {
      var permission = await request(PERMISSIONS.IOS.CAMERA);
      if (permission !== 'granted') return false;
      return true;
    }
  } else if (type === 'library') {
    if (Platform.OS === 'ios') {
      var permission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (permission !== 'granted') return false;
      return true;
    }
  }
}

async function resize(uri) {
  try {
    var imgResized = await ImageResizer.createResizedImage(
      uri,
      800,
      800,
      'JPEG',
      80,
    );
    return imgResized.uri;
  } catch (err) {
    console.log('errrror', err);
    return false;
  }
}

async function resizeVideo(uri) {
  try {
    RNVideoHelper.compress(uri, {
      quality: 'low', // default low, can be medium or high
      defaultOrientation: 0, // By default is 0, some devices not save this property in metadata. Can be between 0 - 360
    })
      .progress((value) => {
        console.warn('progress', value); // Int with progress value from 0 to 1
      })
      .then((compressedUri) => {
        console.warn('compressedUri', compressedUri); // String with path to temporary compressed video
      });
    return false;
  } catch (err) {
    console.log('errror', err);
  }

  return false;
  return newUri;
}

async function takePicture() {
  var permissionVal = await permission('camera');
  if (!permissionVal) return false;

  let promise = new Promise(function(resolve, reject) {
    // executor (the producing code, "singer")
    ImagePicker.launchCamera(options, (response) => {
      if (!response.uri) {
        resolve(false);
      }
      // var uri = await this.resize(response.uri)
      resolve(response.uri);
    });
  });

  return promise;
}

async function pickLibrary() {
  var permissionVal = await permission('library');
  if (!permissionVal) return false;

  let promise = new Promise(function(resolve, reject) {
    // executor (the producing code, "singer")
    ImagePicker.launchImageLibrary(options, (response) => {
      if (!response.uri) {
        resolve(false);
      }
      // var uri = await this.resize(response.uri)
      resolve(response.uri);
    });
  });

  return promise;
}

async function uploadPictureFirebase(localUri, destination) {
  console.log('start upload picture');
  try {
    let imageName = 'groupPicture';
    const imageRef = firebase
      .storage()
      .ref(destination)
      .child(imageName);
    await imageRef.put(localUri, {contentType: 'image/jpg'});
    var url = imageRef.getDownloadURL();
    return url;
  } catch (error) {
    console.log('error upload');
    console.log(error);
    return false;
  }
}

async function uploadVideoFirebase(image, destination) {
  try {
    let imageName = 'content.mp4';
    const imageRef = firebase
      .storage()
      .ref(destination)
      .child(imageName);
    await imageRef.put(image.uri, {contentType: 'video'});
    var url = await imageRef.getDownloadURL();
    return url;
  } catch (err) {
    console.log('error upload', err);
    return false;
  }
}

async function getPhotoUser() {
  const {edges} = await CameraRoll.getPhotos({
    first: 80,
    assetType: 'All',
  });
  return edges;
}

module.exports = {
  takePicture,
  pickLibrary,
  resize,
  resizeVideo,
  uploadPictureFirebase,
  uploadVideoFirebase,
  getPhotoUser,
};
