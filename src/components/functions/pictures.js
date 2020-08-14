import {Platform, PermissionsAndroid} from 'react-native';
import storage from '@react-native-firebase/storage';
import CameraRoll from '@react-native-community/cameraroll';
import Permissions, {
  request,
  PERMISSIONS,
  checkNotifications,
} from 'react-native-permissions';
import ImagePicker from 'react-native-image-picker';
import {ProcessingManager} from 'react-native-video-processing';
import ImageResizer from 'react-native-image-resizer';
import RNThumbnail from 'react-native-thumbnail';
import {DocumentDirectoryPath} from 'react-native-fs';
import {generateID} from '../functions/createEvent';

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
      if (permission !== 'granted') return false;
      return true;
    }
  } else if (type === 'library') {
    if (Platform.OS === 'ios') {
      var permission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (permission !== 'granted') return false;
      return true;
    }
  } else if (type === 'notification') {
    if (Platform.OS === 'ios') {
      const {status, settings} = await checkNotifications();
      if (status !== 'granted') return false;
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

async function getPhotoUser() {
  const permissionLibrary = await permission('library');
  console.log('permissionLibrary', permissionLibrary);
  if (!permissionLibrary) return false;
  const {edges} = await CameraRoll.getPhotos({
    first: 80,
    assetType: 'All',
  });
  return edges;
}

// const getLastVideo = async (limitToLast) => {
//   const permissionLibrary = await permission('library');
//   console.log('permissionLibrary', permissionLibrary);
//   if (!permissionLibrary) return false;
//   const {edges} = await CameraRoll.getPhotos({
//     first: limitToLast,
//     assetType: 'Videos',
//   });
//   return edges;
// };

const sortVideos = (videos) => {
  if (!videos) videos = {};
  return Object.values(videos)
    .sort((a, b) => a.startTimestamp - b.startTimestamp)
    .reverse();
};

const getLastVideo = async () => {
  const {edges} = await CameraRoll.getPhotos({
    first: 1,
    assetType: 'Videos',
  });
  console.log('edges', edges);
  return edges[0].node.image;
};

const generateThumbnail = async (videoPath, timestamp) => {
  const thumbnail = await RNThumbnail.get(videoPath);
  return thumbnail.path;
};

const getVideoUUID = (path) => {
  if (!path) return 'simulator';
  const videoUUID = path
    ? path.split('/')[path.split('/').length - 1].split('.')[0]
    : generateID();
  return videoUUID;
};

const getVideoInfo = async (videoUrl, thumbnail, timestamp) => {
  const pmVideoInfo = await ProcessingManager.getVideoInfo(videoUrl);
  if (!thumbnail || thumbnail === '') {
    thumbnail = await generateThumbnail(videoUrl, timestamp ? timestamp : 0);
  }
  const id = getVideoUUID(videoUrl);
  const videoInfo = {
    id,
    thumbnail,
    url: videoUrl,
    local: true,
    durationSeconds: pmVideoInfo.duration,
    bitrate: pmVideoInfo.bitrate,
    frameRate: pmVideoInfo.frameRate,
    size: pmVideoInfo.size,
    startTimestamp: Date.now(),
  };
  return videoInfo;
};

const resolutionP = (size) => {
  if (!size) return '720p';
  const {height, width} = size;
  if (width > height) return height + 'p';
  return width + 'p';
};

const getNewVideoSavePath = () => {
  return DocumentDirectoryPath + '/' + generateID() + '.mp4';
}

module.exports = {
  takePicture,
  pickLibrary,
  resize,
  rotateImage,
  getPhotoUser,
  sortVideos,
  getVideoInfo,
  getLastVideo,
  permission,
  goToSettings,
  resolutionP,
  getVideoUUID,
  getNewVideoSavePath,
};
