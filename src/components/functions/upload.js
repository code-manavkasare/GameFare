import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

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

const updateProgress = async (progressUpdates, progress) => {
  let updates = {};
  progressUpdates?.uploadPaths?.map((path) => {
    let constructor = {...progressUpdates.constructor[path], progress};
    updates[path] = constructor;
  });
  if (Object.values(updates).length !== 0)
    await database()
      .ref()
      .update(updates);
  return;
};

const uploadVideo = async (
  videoInfo,
  destination,
  name,
  index,
  uploadAction,
  progressUpdates,
) => {
  const {url} = videoInfo;
  if (!url) return;
  const videoRef = storage()
    .ref(destination)
    .child(name);
  await updateProgress(progressUpdates, 0.2);
  const uploadTask = videoRef.putFile(url, {
    contentType: 'video',
    cacheControl: 'no-store',
  });
  const progressDelta = 5 / videoInfo.durationSeconds;
  let progressBuffer = progressDelta < 1 ? progressDelta : 0.7;
  return new Promise((resolve, reject) =>
    uploadTask.on(
      'state_changed',
      async function(snapshot) {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (isNaN(progress)) progress = 0;
        else progress = 0.2 + (Number(progress.toFixed(0)) / 100) * 0.7;
        if (uploadAction)
          uploadAction('setJobProgress', {
            index: index,
            progress,
          });
        if (
          progressUpdates?.uploadPaths &&
          (progress > progressBuffer || progress === 1)
        ) {
          await updateProgress(progressUpdates, progress);
          progressBuffer += progressDelta;
        }
        switch (snapshot.state) {
          case storage.TaskState.PAUSED: // or 'paused'
            break;
          case storage.TaskState.RUNNING: // or 'running'
            break;
        }
      },
      function(error) {
        console.log(error);
        reject(error);
      },
      async () => {
        var url = await videoRef.getDownloadURL();
        await updateProgress(progressUpdates, 1);
        resolve(url);
      },
    ),
  );
};

module.exports = {uploadVideo, uploadImage, updateProgress};
