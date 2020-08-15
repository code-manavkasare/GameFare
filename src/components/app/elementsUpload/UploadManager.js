import {Component} from 'react';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {uploadQueueAction, localVideoLibraryAction} from '../../../actions';
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
    this.processQueue(false);
  }

  processQueue = async (init) => {
    const {uploadQueueAction} = this.props;
    const {queue, status, index} = this.props.uploadQueue;
    if (index === undefined) {
      uploadQueueAction('resetUploadQueue');
    } else {
      const task = queue[index];
      console.log('task', task);
      const startTask =
        (task && (task.progress === 0 || task.progress === undefined)) || init;
      if (status === 'uploading' && startTask) {
        await uploadQueueAction('setJobProgress', {
          index: index,
          progress: 0.01,
        });
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
    }
  };

  completeTask(index) {
    const {uploadQueue, uploadQueueAction} = this.props;
    if (typeof uploadQueue.queue[index + 1] == 'undefined')
      uploadQueueAction('setIndex', 0);
    uploadQueueAction('dequeueFileUpload', index);
  }

  uploadImageAtQueueIndex = async (index) => {
    const {uploadQueue, uploadQueueAction} = this.props;
    const uploadTask = uploadQueue.queue[index];
    if (uploadTask) {
      const {storageDestination, url} = uploadTask;
      const imageUrl = await uploadImage(url, storageDestination, 'image.jpg');
      uploadQueueAction('setJobProgress', {index: index, progress: 1});
      await this.completeTask(index);
      database()
        .ref()
        .update({
          [`${storageDestination}/thumbnail`]: imageUrl,
        });
    }
  };

  uploadVideoAtQueueIndex = async (index) => {
    const {
      uploadQueue,
      uploadQueueAction,
      localVideoLibraryAction,
    } = this.props;
    const uploadTask = uploadQueue.queue[index];
    if (uploadTask) {
      const {videoInfo, storageDestination} = uploadTask;
      const videoUrl = await uploadVideo(uploadTask, uploadQueueAction, index);
      uploadQueueAction('setJobProgress', {index: index, progress: 1});
      localVideoLibraryAction('deleteVideo', videoInfo.id);
      await this.completeTask(index);
      database()
        .ref()
        .update({
          [`${storageDestination}/url`]: videoUrl,
        });
    }
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
  {uploadQueueAction, localVideoLibraryAction},
)(UploadManager);
