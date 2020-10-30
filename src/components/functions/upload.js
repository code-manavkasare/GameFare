import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

import {store} from '../../../reduxStore';
import {setUploadTaskError} from '../../actions/uploadQueueActions';
import {setArchive} from '../../actions/archivesActions';
import {
  claimCloudVideo,
  updateCloudUploadProgress,
  updateThumbnailCloud,
} from '../database/firebase/videosManagement.js';
import {removeUserLocalArchive} from '../../actions/localVideoLibraryActions';
import {deleteLocalVideoFile} from './videoManagement.js';

const defaultVideoFilename = 'archive.mp4';
const videoContentType = 'video/mp4';
const defaultImageFilename = 'thumbnail.png';
const imageContentType = 'image/jpeg';
const defaultRecordAudioFilename = 'audioRecord.mp4';
const audioRecordContentType = 'audio/mp4';

const afterUpload = async (uploadTask, cloudUrl) => {
  if (uploadTask.type === 'audioRecord') {
    if (uploadTask.videoInfoForCloudCut) {
      const {videoInfoForCloudCut} = uploadTask;
      const updates = {
        ...videoInfoForCloudCut,
        audioRecordUrl: cloudUrl,
      };
      database()
        .ref(`archivedStreams/${videoInfoForCloudCut.id}`)
        .set(updates);
    }
  }
  if (uploadTask.type === 'video') {
    const {cloudID, videoInfo} = uploadTask;
    await claimCloudVideo(videoInfo);
    await store.dispatch(
      setArchive({
        url: cloudUrl,
        id: cloudID,
        local: false,
        progress: false,
        startTimestamp: videoInfo.startTimestamp,
      }),
    );
    await store.dispatch(removeUserLocalArchive(cloudID));
    deleteLocalVideoFile(videoInfo.url);
  }
  if (uploadTask.type === 'image') {
    const {cloudID} = uploadTask;
    await updateThumbnailCloud({
      id: cloudID,
      thumbnail: cloudUrl,
      startTimestamp: Date.now(),
    });
    await store.dispatch(
      setArchive({
        id: cloudID,
        thumbnail: cloudUrl,
      }),
    );
    deleteLocalVideoFile(uploadTask.url);
  }
};

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

const isQueueVisible = (queue) => {
  return (
    queue &&
    Object.values(queue).length > 0 &&
    Object.values(queue).some((task) => task.displayInList)
  );
};

const getCurrentUploadingTask = (queue) => {
  let currentUploadTask = false;
  for (const uploadTask of Object.values(queue)) {
    if (uploadTask.started) {
      currentUploadTask = uploadTask;
    }
  }
  return currentUploadTask;
};

export {
  afterUpload,
  getCurrentUploadingTask,
  isArchiveUploading,
  uploadFile,
  sortUploadTasks,
  isQueueVisible,
};
