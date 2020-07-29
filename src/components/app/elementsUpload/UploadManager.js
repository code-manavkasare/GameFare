import {Component} from 'react';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';
import {uploadImage, uploadVideo} from '../../functions/upload';

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
    const {queue} = this.props.uploadQueue;
    this.processQueue(false);
  }

  processQueue = async (init) => {
    const {uploadQueueAction} = this.props;
    const {queue, status, index} = this.props.uploadQueue;
    if (index === undefined) uploadQueueAction('resetUploadQueue');
    const task = queue[index];

    const uploadInstruction = status === 'uploading';
    const readyTask = (task && task.progress === 0) || init;

    if (uploadInstruction && readyTask) {
      switch (task.type) {
        case 'video':
          await this.uploadVideoAtQueueIndex(index);
        case 'image':
          await this.uploadImageAtQueueIndex(index);
        default:
          console.log('ERROR: UploadManager -- upload task of unknown type');
          break;
      }
    }
  };

  completeTask(index) {
    const {uploadQueue, uploadQueueAction} = this.props;

    if (typeof uploadQueue.queue[index + 1] == 'undefined')
      uploadQueueAction('setIndex', 0);
    uploadQueueAction('dequeueFileUpload', index);
  }

  databaseUpdates(url, task) {
    const firebaseUpdates = task?.firebaseUpdates;
    const destinationFile = task?.destinationFile;
    if (firebaseUpdates && destinationFile) {
      let updates = {...firebaseUpdates};
      updates[destinationFile] = url;
      database()
        .ref()
        .update(updates);
    }
  }

  uploadImageAtQueueIndex = async (index) => {
    const {uploadQueue, uploadQueueAction} = this.props;
    const imageInfo = uploadQueue.queue[index];

    if (!imageInfo || imageInfo?.simulator) return;

    const {storageDestination} = imageInfo;
    const imageUrl = await uploadImage(
      //  'file:///' +
      imageInfo.url,
      storageDestination,
      'image.jpg',
    );

    uploadQueueAction('setJobProgress', {index: index, progress: 1});

    await this.completeTask(index);

    if (imageInfo.updateFirebaseAfterUpload)
      await this.databaseUpdates(imageUrl, imageInfo);
  };

  uploadVideoAtQueueIndex = async (index) => {
    const {uploadQueue, uploadQueueAction} = this.props;
    let videoInfo = uploadQueue.queue[index];
    if (videoInfo.simulator) return;
    const {storageDestination} = videoInfo;
    let {progressUpdates} = videoInfo;
    if (videoInfo.uploadThumbnail) {
      const thumbnailUrl = await uploadImage(
        'file:///' + videoInfo.thumbnail,
        storageDestination,
        'thumbnail.jpg',
      );
      videoInfo.firebaseUpdates = {
        ...videoInfo.firebaseUpdates,
        [`${storageDestination}/thumbnail`]: thumbnailUrl,
      };
    }
    if (progressUpdates?.uploadPaths) {
      let constructor = {...progressUpdates.constructor};
      await database()
        .ref()
        .update(constructor);
    }
    uploadQueueAction('setJobProgress', {index: index, progress: 0.2});
    const videoUrl = await uploadVideo(
      videoInfo,
      storageDestination,
      'archive.mp4',
      index,
      uploadQueueAction,
      progressUpdates,
    );
    uploadQueueAction('setJobProgress', {index: index, progress: 1});

    if (videoInfo.updateFirebaseAfterUpload) {
      await this.databaseUpdates(videoUrl, videoInfo);
    }
    await this.completeTask(index);
  };
}

const mapStateToProps = (state) => {
  return {
    uploadQueue: state.uploadQueue,
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(UploadManager);
