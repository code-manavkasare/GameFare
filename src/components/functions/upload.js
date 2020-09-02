import storage from '@react-native-firebase/storage';
import {store} from '../../../reduxStore';
import {
  setUploadTaskProgress,
  setUploadTaskError,
} from '../../actions/uploadQueueActions';

//import database from '@react-native-firebase/database';
//import {updateCloudProgress} from '../database/firebase/videosManagement';

const defaultVideoFilename = 'archive.mp4';
const defaultImageFilename = 'image.jpg';

const sortUploadTasks = (uploadTasks) => {
  return uploadTasks.sort((a, b) => a.timeSubmitted - b.timeSubmitted);
};

const uploadVideo = (uploadTask) => {
  if (uploadTask && !uploadTask.filename) {
    uploadTask.filename = defaultVideoFilename;
  }
  const {videoInfo, storageDestination, filename} = uploadTask;
  const {url} = videoInfo;
  if (url) {
    const videoRef = storage()
      .ref(storageDestination)
      .child(filename);
    const firebaseUploadTask = videoRef.putFile(url, {
      contentType: 'video',
      cacheControl: 'no-store',
    });
    return {
      firebaseUploadTask,
      uploadComplete: new Promise((resolve, reject) => {
        firebaseUploadTask.on(storage.TaskEvent.STATE_CHANGED, {
          next: (snapshot) => uploadNext(snapshot, uploadTask),
          error: (error) => {
            uploadError(error, uploadTask);
            reject(error);
          },
          complete: async () => {
            const cloudUrl = await uploadComplete(uploadTask);
            resolve(cloudUrl);
          },
        });
      }),
    };
  }
};

const uploadImage = (uploadTask) => {
  if (uploadTask && !uploadTask.filename) {
    uploadTask.filename = defaultImageFilename;
  }
  const {url, storageDestination, filename} = uploadTask;
  if (url) {
    const imageRef = storage()
      .ref(storageDestination)
      .child(filename);
    const firebaseUploadTask = imageRef.putFile(url, {
      contentType: 'image/jpeg',
      cacheControl: 'no-store',
    });
    return {
      firebaseUploadTask,
      uploadComplete: new Promise((resolve, reject) => {
        firebaseUploadTask.on(storage.TaskEvent.STATE_CHANGED, {
          next: (snapshot) => uploadNext(snapshot, uploadTask),
          error: (error) => {
            uploadError(error, uploadTask);
            reject(error);
          },
          complete: async () => {
            const cloudUrl = await uploadComplete(uploadTask);
            resolve(cloudUrl);
          },
        });
      }),
    };
  }
};

const uploadNext = (uploadSnapshot, uploadTask) => {
  const {id} = uploadTask;
  const progress = uploadSnapshot.bytesTransferred / uploadSnapshot.totalBytes;
  if (progress) {
    store.dispatch(
      setUploadTaskProgress({
        id,
        progress,
      }),
    );
  }
};

const uploadError = (error, uploadTask) => {
  console.log('uploadError', error);
  const {id} = uploadTask;
  store.dispatch(
    setUploadTaskError({
      id,
      error,
    }),
  );
};

const uploadComplete = async (uploadTask) => {
  const {storageDestination, filename} = uploadTask;
  const cloudUrl = await storage()
    .ref(storageDestination)
    .child(filename)
    .getDownloadURL();
  return cloudUrl;
};

module.exports = {uploadVideo, uploadImage, sortUploadTasks};
