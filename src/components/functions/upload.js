import storage from '@react-native-firebase/storage';
import {store} from '../../../reduxStore';
import {
  setUploadTaskProgress,
  setUploadTaskError,
} from '../../actions/uploadQueueActions';
import {
  setArchive
} from '../../actions/archivesActions';


//import database from '@react-native-firebase/database';
import {updateCloudUploadProgress} from '../database/firebase/videosManagement';
import {updateLocalUploadProgress} from '../functions/videoManagement';

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
  const {videoInfo} = uploadTask;
  const progress = uploadSnapshot.bytesTransferred / uploadSnapshot.totalBytes;
  if (progress && videoInfo && videoInfo.id) {
    updateCloudUploadProgress(videoInfo.id, progress);
    store.dispatch(setArchive({...videoInfo, progress}));
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
  const {storageDestination, filename, videoInfo} = uploadTask;
  if (videoInfo && videoInfo.id) {
    updateCloudUploadProgress(videoInfo.id, null);
    store.dispatch(setArchive({...videoInfo, progress: null}));
  }
  const cloudUrl = await storage()
    .ref(storageDestination)
    .child(filename)
    .getDownloadURL();
  return cloudUrl;
};

module.exports = {uploadVideo, uploadImage, sortUploadTasks};
