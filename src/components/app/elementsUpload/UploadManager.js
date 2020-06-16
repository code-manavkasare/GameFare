import {Component} from 'react';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';

class UploadManager extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return null;
  }

  componentDidMount() {
    this.processQueue(true);
  }

  componentDidUpdate(prevProps, prevState) {
    this.processQueue(false);
  }

  processQueue = async (init) => {
    const {uploadQueueAction} = this.props;
    const {queue, status, index} = this.props.uploadQueue;
    if (index === undefined) uploadQueueAction('resetUploadQueue');
    const task = queue[index];

    const uploadInstruction = status === 'uploading';
    const readyTask = (task && task.progress === 0) || init;
    console.log('processQueue', uploadInstruction, readyTask);

    if (uploadInstruction && readyTask) {
      switch (task.type) {
        case 'video':
          await this.uploadVideoAtQueueIndex(index);
        case 'image':
          await this.uploadImageAtQueueIndex(index);
        default:
          break;
      }
      await this.completeTask(index);
    }
  };

  completeTask(index) {
    const {uploadQueue, uploadQueueAction} = this.props;

    if (typeof uploadQueue.queue[index + 1] == 'undefined')
      uploadQueueAction('setIndex', 0);
    uploadQueueAction('dequeueFileUpload', index);
  }

  databaseUpdates(url) {
    const {queue, index} = this.props.uploadQueue;
    const task = queue[index];
    const {firebaseUpdates, destinationFile} = task;

    let updates = firebaseUpdates;
    updates[destinationFile] = url;
    console.log('databaseUpdates', updates);
    database()
      .ref()
      .update(updates);
  }

  uploadImageAtQueueIndex = async (index) => {
    const {uploadQueue, uploadQueueAction} = this.props;
    const imageInfo = uploadQueue.queue[index];

    if (imageInfo.simulator) return;

    const {storageDestination} = imageInfo;

    console.log('Image info: ', imageInfo);

    const imageUrl = await this.uploadImage(
      //  'file:///' +
      imageInfo.path,
      storageDestination,
      'image.jpg',
    );
    console.log('Image URL: ', imageUrl);

    uploadQueueAction('setJobProgress', {index: index, progress: 1});

    if (imageInfo.updateFirebaseAfterUpload)
      await this.databaseUpdates(imageUrl);
    console.log('Image uploaded.');
  };

  uploadVideoAtQueueIndex = async (index) => {
    const {uploadQueue, uploadQueueAction} = this.props;
    const videoInfo = uploadQueue.queue[index];

    if (videoInfo.simulator) return;

    const {storageDestination} = videoInfo;

    console.log('Video info: ', videoInfo);

    if (videoInfo.uploadThumbnail) {
      const thumbnailUrl = await this.uploadImage(
        'file:///' + videoInfo.thumbnail,
        storageDestination,
        'thumbnail.jpg',
      );
      console.log('Thumbnail URL: ', thumbnailUrl);
    }

    uploadQueueAction('setJobProgress', {index: index, progress: 0.2});

    const videoUrl = await this.uploadVideo(
      videoInfo,
      storageDestination,
      'archive.mp4',
      index,
    );
    console.log('Video URL: ', videoUrl);

    uploadQueueAction('setJobProgress', {index: index, progress: 1});

    if (videoInfo.updateFirebaseAfterUpload)
      await this.databaseUpdates(videoUrl);
    console.log('Video uploaded.');
  };

  uploadImage = async (path, destination, name) => {
    console.log('uploadImage', path, destination);
    const videoRef = storage()
      .ref(destination)
      .child(name);
    await videoRef.putFile(path, {
      contentType: 'image/jpeg',
      cacheControl: 'no-store',
    });
    let url = await videoRef.getDownloadURL();
    console.log('url', url);
    return new Promise((resolve, reject) => {
      if (url) resolve(url);
      else reject(url);
    });
  };

  uploadVideo = async (videoInfo, destination, name, index) => {
    const {path} = videoInfo;
    const {uploadQueueAction} = this.props;

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
          console.log('Video upload progress...', progress);
          uploadQueueAction('setJobProgress', {
            index: index,
            progress: 0.2 + (Number(progress.toFixed(0)) / 100) * 0.8,
          });
          switch (snapshot.state) {
            case storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case storage.TaskState.RUNNING: // or 'running'
              console.log('Upload video is running');
              break;
          }
        },
        function(error) {
          console.log(error);
          reject(error);
        },
        async () => {
          console.log('Upload complete');
          var url = await videoRef.getDownloadURL();
          resolve(url);
        },
      ),
    );
  };
}

const mapStateToProps = (state) => {
  return {
    uploadQueue: state.uploadQueue,
    userID: state.user.userID,
    UploadManager,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(UploadManager);
