import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

import {updateCloudProgress} from '../database/firebase/videosManagement';

const uploadImage = async (path, destination, name) => {
  if (!path) return;
  const videoRef = storage()
    .ref(destination)
    .child(name);
  await videoRef.putFile(path, {
    contentType: 'image/jpeg',
    cacheControl: 'no-store',
  });
  let url = await videoRef.getDownloadURL();
  return new Promise((resolve, reject) => {
    if (url) resolve(url);
    else reject(url);
  });
};

const uploadVideo = async (uploadTask, uploadQueueAction, index) => {
  const {
    videoInfo,
    cloudID,
    storageDestination,
    subscribedToProgress,
  } = uploadTask;
  const {url} = videoInfo;
  if (!url) return;
  const videoRef = storage()
    .ref(storageDestination)
    .child('archive.mp4');
  if (subscribedToProgress?.length > 0) {
    updateCloudProgress(cloudID, subscribedToProgress, 0.2);
  }
  const uploading = videoRef.putFile(url, {
    contentType: 'video',
    cacheControl: 'no-store',
  });
  let progressBuffer = 0.2;
  let progressDelta = 0.2;
  return new Promise((resolve, reject) =>
    uploading.on(
      'state_changed',
      async function(snapshot) {
        if (snapshot.error) {
          console.log('UPLOAD ERROR', snapshot.error);
        } else {
          let progress = (snapshot.bytesTransferred / snapshot.totalBytes);
          if (uploadQueueAction && progress !== 0) {
            uploadQueueAction('setJobProgress', {
              id: uploadTask.id,
              progress,
            });
          }
          if (
            subscribedToProgress?.length > 0 &&
            (progress > progressBuffer || progress === 1)
          ) {
            updateCloudProgress(cloudID, subscribedToProgress, progress);
            progressBuffer += progressDelta;
          }
        }
      },
      function(error) {
        console.log(error);
        reject(error);
      },
      async () => {
        const cloudUrl = await videoRef.getDownloadURL();
        if (subscribedToProgress?.length > 0)
          updateCloudProgress(cloudID, subscribedToProgress, 1);
        resolve(cloudUrl);
      },
    ),
  );
};

module.exports = {uploadVideo, uploadImage};
