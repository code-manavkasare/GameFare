import storage from '@react-native-firebase/storage';

import {store} from '../../../reduxStore';
import {setUploadTaskError} from '../../actions/uploadQueueActions';
import {setArchive} from '../../actions/archivesActions';
import {updateCloudUploadProgress} from '../database/firebase/videosManagement';

const defaultVideoFilename = 'archive.mp4';
const videoContentType = 'video/mp4';
const defaultImageFilename = 'thumbnail.png';
const imageContentType = 'image/jpeg';
const defaultRecordAudioFilename = 'audioRecord.mp4';
const audioRecordContentType = 'audio/mp4';

const isArchiveUploading = (videoInfos) => {
  let isUploading = false;
  for (const videoInfo of Object.values(videoInfos)) {
    if (videoInfo.progress) {
      isUploading = true;
    }
  }
  return isUploading;
};

const sortUploadTasks = (uploadTasks) => {
  return uploadTasks.sort((a, b) => a.timeSubmitted - b.timeSubmitted);
};

const uploadFile = (uploadTask) => {
  const {url, videoInfo, storageDestination, onProgress, type} = uploadTask;
  let contentType = '';
  let localUrl = '';
  if (uploadTask && !uploadTask.filename) {
    switch (type) {
      case 'video':
        uploadTask.filename = defaultVideoFilename;
        contentType = videoContentType;
        localUrl = videoInfo.url;
        break;
      case 'image':
        uploadTask.filename = defaultImageFilename;
        contentType = imageContentType;
        localUrl = url;
        break;
      case 'audioRecord':
        uploadTask.filename = defaultRecordAudioFilename;
        contentType = audioRecordContentType;
        localUrl = url;
        break;
      default:
        console.log(
          `${type} is not a valid type, check upload.js>uploadFile()`,
        );
    }
  }

  if (localUrl) {
    const fileRef = storage()
      .ref(storageDestination)
      .child(uploadTask.filename);
    console.log(`uploading to ${storageDestination}/${uploadTask.filename}`);
    const firebaseUploadTask = fileRef.putFile(localUrl, {
      contentType,
      cacheControl: 'no-store',
    });
    return {
      firebaseUploadTask,
      uploadComplete: new Promise((resolve, reject) => {
        firebaseUploadTask.on(storage.TaskEvent.STATE_CHANGED, {
          next: (snapshot) => uploadNext(snapshot, onProgress),
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

const uploadNext = (uploadSnapshot, onProgress) => {
  const progress = uploadSnapshot.bytesTransferred / uploadSnapshot.totalBytes;
  if (progress && onProgress) {
    onProgress(progress);
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

module.exports = {
  isArchiveUploading,
  uploadFile,
  sortUploadTasks,
};
