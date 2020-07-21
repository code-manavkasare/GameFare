import storage from '@react-native-firebase/storage';

const uploadImage = async (path, destination, name) => {
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

const uploadVideo = async (videoInfo, destination, name, index, uploadAction) => {
  const {path} = videoInfo;

  const videoRef = storage()
    .ref(destination)
    .child(name);
  const uploadTask = videoRef.putFile(path, {
    contentType: 'video',
    cacheControl: 'no-store',
  });
  return new Promise((resolve, reject) =>
    uploadTask.on(
      'state_changed',
      async function(snapshot) {
        let progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (isNaN(progress)) progress = 0;
        if (uploadAction) uploadAction('setJobProgress', {
          index: index,
          progress: 0.2 + (Number(progress.toFixed(0)) / 100) * 0.8,
        });
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
        resolve(url);
      },
    ),
  );
};

module.exports = {uploadVideo, uploadImage};