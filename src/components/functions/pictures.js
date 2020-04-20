import React, {Component} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import firebase from 'react-native-firebase';
import CameraRoll from '@react-native-community/cameraroll';
import {request, PERMISSIONS} from 'react-native-permissions';
import ImagePicker from 'react-native-image-picker';
import {ProcessingManager} from 'react-native-video-processing';
// import RNVideoHelper from 'react-native-video-helper';

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

async function rotateImage(uri, width, height, degrees) {
  const rotatedUri = await ImageResizer.createResizedImage(
    uri,
    height,
    width,
    'JPEG',
    100,
    degrees,
  );
  return rotatedUri;
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
    console.log('error upload', error);
    return false;
  }
}

async function uploadVideoFirebase(image, destination, name) {
  try {
    const imageRef = firebase
      .storage()
      .ref(destination)
      .child(name);
    const uploadTask = imageRef.put(image.uri, {contentType: 'video'});

    uploadTask.on(
      'state_changed',
      function(snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      },
      function(error) {
        console.log(error);
      },
      async () => {
        console.log('Upload complete');
        var url = await imageRef.getDownloadURL();
        console.log('url: ', url);
        return url;
      },
    );
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

const sortVideos = (videos) => {
  if (!videos) videos = {};
  return Object.values(videos)
    .sort((a, b) => a.startTimestamp - b.startTimestamp)
    .reverse();
};

module.exports = {
  takePicture,
  pickLibrary,
  resize,
  rotateImage,
  uploadPictureFirebase,
  uploadVideoFirebase,
  getPhotoUser,
  sortVideos,
};
