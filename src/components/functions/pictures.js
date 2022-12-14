import React from 'react';
import {Platform, Image} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import Permissions, {
  request,
  PERMISSIONS,
  checkNotifications,
} from 'react-native-permissions';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-picker';
import {ProcessingManager} from 'react-native-video-processing';
import ImageResizer from 'react-native-image-resizer';
import {createThumbnail} from 'react-native-create-thumbnail';
import RNFS from 'react-native-fs';
import {fromHsv} from 'react-native-color-picker';

import colors from '../style/colors';
import {navigate} from '../../../NavigationService';
import {store} from '../../store/reduxStore';
import {DocumentDirectoryPath} from 'react-native-fs';
import {generateID} from '../functions/utility';
import {deleteLocalVideoFile} from './videoManagement';

const options = {
  quality: 1.0,
  storageOptions: {
    skipBackup: true,
  },
};

const permission = async (type) => {
  if (type === 'camera') {
    if (Platform.OS === 'ios') {
      var permission = await request(PERMISSIONS.IOS.CAMERA);
      if (permission !== 'granted') {
        return false;
      }
      return true;
    }
  } else if (type === 'library') {
    if (Platform.OS === 'ios') {
      var permission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (permission !== 'granted') {
        return false;
      }
      return true;
    }
  } else if (type === 'notification') {
    if (Platform.OS === 'ios') {
      const {status, settings} = await checkNotifications();
      if (status !== 'granted') {
        return false;
      }
      return true;
    }
  }
};

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

const goToSettings = () => {
  Permissions.openSettings();
};

async function takePicture() {
  var permissionVal = await permission('camera');
  if (!permissionVal) {
    return false;
  }

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
  if (!permissionVal) {
    return false;
  }

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

async function getPhotoUser() {
  const permissionLibrary = await permission('library');
  if (!permissionLibrary) {
    return false;
  }
  const {edges} = await CameraRoll.getPhotos({
    first: 80,
    assetType: 'All',
  });
  return edges;
}
const getLastVideo = async () => {
  const {edges} = await CameraRoll.getPhotos({
    first: 1,
    assetType: 'Videos',
  });
  return edges[0].node.image;
};
const ge10tLastVideo = async () => {
  const userID = store.getState().user.userID;
  const {edges} = await CameraRoll.getPhotos({
    first: 10,
    assetType: 'Videos',
  });

  let videos = [];
  for (var i in edges) {
    const video = edges[i];
    const {uri} = video.node.image;
    const appleId = uri.substring(5, 41);
    const destPath = RNFS.DocumentDirectoryPath + '/' + appleId;
    const path = await RNFS.copyAssetsVideoIOS(
      `assets-library://asset/asset.${'mov'}?id=${appleId}&ext=${'mov'}`,
      destPath,
    );
    const videoInfo = await getVideoInfo(path);
    videos.push(videoInfo);
  }
  return videos;
};

const generateThumbnail = async (videoPath, timeStamp) => {
  let thumbnail = await createThumbnail({
    url: videoPath,
    timeStamp: timeStamp ? timeStamp : 0,
  });
  var {uri, size} = await ImageResizer.createResizedImage(
    thumbnail.path,
    thumbnail.width,
    thumbnail.height,
    'JPEG',
    10,
  );
  await deleteLocalVideoFile(thumbnail.path);
  thumbnail.path = uri;
  return thumbnail;
};

const getVideoUUID = (path) => {
  if (!path) {
    return 'simulator';
  }
  const videoUUID = path
    ? path.split('/')[path.split('/').length - 1].split('.')[0]
    : generateID();
  return videoUUID;
};

const getNativeVideoInfo = async (appleVideoID) => {
  const savePath = getNewVideoSavePath();
  const url = await RNFS.copyAssetsVideoIOS(
    `assets-library://asset/asset.${'mov'}?id=${appleVideoID}&ext=${'mov'}`,
    savePath,
  );
  let videoInfo = await getVideoInfo(url);
  return {...videoInfo, fromNativeLibrary: true};
};

const getOpentokVideoInfo = async (videoUrl) => {
  const savePath = getNewVideoSavePath();
  await RNFS.copyFile(videoUrl, savePath);
  return await getVideoInfo(savePath);
};

const getVideoInfo = async (videoUrl) => {
  const pmVideoInfo = await ProcessingManager.getVideoInfo(videoUrl);
  const {path: newtThumbnail, height, width} = await generateThumbnail(
    videoUrl,
    0,
  );
  const id = getVideoUUID(videoUrl);
  const videoInfo = {
    id,
    thumbnail: newtThumbnail,
    url: videoUrl,
    durationSeconds: pmVideoInfo.duration,
    thumbnailSize: {height, width},
    bitrate: pmVideoInfo.bitrate,
    frameRate: pmVideoInfo.frameRate,
    size: pmVideoInfo.size,
    startTimestamp: Date.now(),
  };
  return videoInfo;
};

const resolutionP = (size) => {
  if (!size) {
    return '720p';
  }
  const {height, width} = size;
  if (width > height) {
    return height + 'p';
  }
  return width + 'p';
};

const getNewVideoSavePath = () => {
  return DocumentDirectoryPath + '/' + generateID() + '.mov';
};

const getNewAudioSavePath = () => {
  return DocumentDirectoryPath + '/' + generateID() + '.mp4';
};

const valueColor = (value) => {
  return fromHsv({h: value, s: 0.8, v: 1});
};

const updateVideoSavePath = (oldPath) => {
  const docsDirIndex = oldPath.indexOf('/Documents');
  const docsSubDir = oldPath.slice(docsDirIndex + 10);
  return DocumentDirectoryPath + docsSubDir;
};

async function uploadPictureFirebase(localUri, destination) {
  try {
    let imageName = 'groupPicture';
    const imageRef = storage().ref(destination + '/' + imageName);
    await imageRef.putFile(localUri);
    var url = imageRef.getDownloadURL();
    return url;
  } catch (error) {
    console.log('error upload', error);
    return false;
  }
}

async function uploadVideoFirebase(image, destination) {
  try {
    let imageName = 'content.mp4';
    const imageRef = storage()
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

const getImageSize = async (uri) => {
  if (uri.includes('https'))
    return new Promise((resolve) => {
      try {
        Image.getSize(
          uri,
          (width, height) => {
            console.log('whooo ', {width, height});
            resolve({width, height});
          },
          (error) => {
            console.log(`Couldn't get the image size: ${error.message}`);
            resolve({});
          },
        );
      } catch (err) {
        console.log('error get size', err);
        resolve({});
      }
    });
  return {};
};

const checkVideoLibraryAccess = async () => {
  const permissionLibrary = await permission('library');
  if (!permissionLibrary) {
    return navigate('Alert', {
      textButton: 'Open Settings',
      title:
        'You need to allow access to your library before adding videos from the camera roll.',
      colorButton: 'blue',
      onPressColor: colors.blueLight,
      onGoBack: () => goToSettings(),
      icon: (
        <Image
          source={require('../../img/icons/technology.png')}
          style={{width: 25, height: 25}}
        />
      ),
    });
  }
};

export {
  checkVideoLibraryAccess,
  takePicture,
  pickLibrary,
  resize,
  rotateImage,
  getPhotoUser,
  getVideoInfo,
  getLastVideo,
  permission,
  goToSettings,
  resolutionP,
  getVideoUUID,
  ge10tLastVideo,
  getNativeVideoInfo,
  getNewVideoSavePath,
  getNewAudioSavePath,
  valueColor,
  updateVideoSavePath,
  getOpentokVideoInfo,
  generateThumbnail,
  uploadPictureFirebase,
  uploadVideoFirebase,
  getImageSize,
};
