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

const generateThumbnail = async (videoPath,timeStamp) => {
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

const getVideoInfo = async (videoUrl, createThumbnail,timeStamp) => {
  console.log('');
  const pmVideoInfo = await ProcessingManager.getVideoInfo(videoUrl);
  const thumbnail = createThumbnail
    ? await generateThumbnail(videoUrl,timeStamp)
    : undefined;
  const id = getVideoUUID(videoUrl);
  const videoInfo = {
    id: id,
    local: true,
    id: id,
    thumbnail: thumbnail,
    url: videoUrl,
    durationSeconds: pmVideoInfo.duration,
    bitrate: pmVideoInfo.bitrate,
    frameRate: pmVideoInfo.frameRate,
    size: pmVideoInfo.size,
  };
  return videoInfo;
};

const resolutionP = (size) => {
  if (!size) return '720p';
  const {height, width} = size;
  if (width > height) return height + 'p';
  return width + 'p';
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
  getVideoInfo,
  getLastVideo,
  permission,
  goToSettings,
  resolutionP,
  getVideoUUID,
};
