import React, { Component } from 'react';
import {
  Platform,
  PermissionsAndroid,
} from 'react-native';

import firebase from 'react-native-firebase'
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
    if (type == 'camera') {
        if (Platform.OS == 'ios') {
            var permission = await request(PERMISSIONS.IOS.CAMERA)
            console.log('permission')
            console.log(permission)
            if (permission != 'granted') return false
            return true
        }
    } else if (type == 'library') {
        if (Platform.OS == 'ios') {
            var permission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
            console.log('permission')
            console.log(permission)
            if (permission != 'granted') return false
            return true
        }
    }
    
}

async function resize(uri){
    try {
      console.log("resizing ", uri)
      var imgResized = await ImageResizer.createResizedImage(uri, 800, 800, 'JPEG', 80)
      return imgResized.uri
    } catch (err) {
    console.log('errrror')
    console.log(err)
      return false
    }
}

async function resizeVideo (uri) {
    try {
        console.log('uri',uri)
        // const newUri = await RNVideoHelper.compress(uri, {
        //     quality: 'medium', // default low, can be medium or high
        //     defaultOrientation: 0 // By default is 0, some devices not save this property in metadata. Can be between 0 - 360
        // })
        // console.log('resized video',newUri)
        return false
    } catch (err) {
        console.log('errror',err)
    }
    
    return false
    return newUri
}

async function takePicture() {
    var permissionVal = await permission('camera')
    if (!permissionVal) return false

    let promise = new Promise(function(resolve, reject) {
        // executor (the producing code, "singer")
        ImagePicker.launchCamera(options, response => {    
            console.log('image')
            console.log(response)
            if (!response.uri) {
                resolve(false)
            }
            // var uri = await this.resize(response.uri)
            resolve(response.uri)
        })
        
    });

    return promise
}

async function pickLibrary() {
    var permissionVal = await permission('library')
    if (!permissionVal) return false

    let promise = new Promise(function(resolve, reject) {
        // executor (the producing code, "singer")
        ImagePicker.launchImageLibrary(options, response => {    
            console.log('image')
            console.log(response)
            if (!response.uri) {
                resolve(false)
            }
            // var uri = await this.resize(response.uri)
            resolve(response.uri)
        })
        
    });

    return promise

}

async function uploadPictureFirebase  (localUri,destination) {
    console.log('start upload picture')
    try {
        let imageName = 'groupPicture'
        const imageRef = firebase.storage().ref(destination).child(imageName)
        await imageRef.put(localUri, { contentType: 'image/jpg' })
        var url = imageRef.getDownloadURL()
        return url
      } catch (error) {
        console.log('error upload')
        console.log(error)
        return false
      }
}

async function uploadVideoFirebase (image,destination) {
    try {
        console.log('start upload video ',image)
        let imageName = 'content.mp4'
        const imageRef = firebase.storage().ref(destination).child(imageName)
        await imageRef.put(image.uri, {contentType:'video' })
        var url = await imageRef.getDownloadURL()
        console.log('upload video',url)
        // return false
        return url
      } catch (error) {
        console.log('error upload')
        console.log(error)
        return false
      }
}


  
module.exports = {takePicture,pickLibrary,resize,resizeVideo,uploadPictureFirebase,uploadVideoFirebase};