import React, {Component} from 'react';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {uploadQueueAction, localVideoLibraryAction} from '../../../actions';
import {
  uploadImage,
  uploadVideo,
  sortUploadTasks,
} from '../../functions/upload';
import BackgroundUploadHelper from './BackgroundUploadHelper';

class UploadManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadInProgress: null,
      savedBackgroundUpload: null,
    };
  }

  componentDidMount() {
    const {isConnected} = this.props;
    if (isConnected) {
      this.manageUploads();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      isConnected: prevIsConnected,
      connectionType: prevConnectionType,
    } = prevProps;
    const {isConnected, uploadInProgress, connectionType} = this.props;
    const lostConnection = prevIsConnected && !isConnected;
    const gainedConnection = !prevIsConnected && isConnected;
    const lostWifi = connectionType !== 'wifi' && prevConnectionType === 'wifi';
    const gainedWifi = connectionType === 'wifi' && prevConnectionType !== 'wifi';
    if (uploadInProgress) {
      const {isBackground} = uploadInProgress.uploadTask;
      if (lostConnection || (isBackground && lostWifi)) {
        this.pauseUploadInProgress();
      } else if (
        (!isBackground && gainedConnection) ||
        (isBackground && gainedWifi)
      ) {
        this.resumeUploadInProgress();
      }
    } else if (isConnected) {
      this.manageUploads();
    }
  }

  resumeUploadInProgress() {
    const {uploadInProgress} = this.state;
    const {uploadQueueAction} = this.props;
    if (uploadInProgress) {
      const {uploadTask, firebaseUploadTask} = uploadInProgress;
      uploadQueueAction('resumeUploadTask', uploadTask.id);
      const resumed = firebaseUploadTask.resume();
      if (!resumed) {
        console.log('upload task resume had no effect');
      }
    }
  }

  pauseUploadInProgress() {
    const {uploadInProgress} = this.state;
    const {uploadQueueAction} = this.props;
    if (uploadInProgress) {
      const {uploadTask, firebaseUploadTask} = uploadInProgress;
      uploadQueueAction('pauseUploadTask', uploadTask);
      const paused = firebaseUploadTask.pause();
      if (!paused) {
        console.log('upload task pause had no effect');
      }
    }
  }

  finishUploadInProgress() {
    const {uploadInProgress} = this.state;
    const {uploadQueueAction} = this.props;
    if (uploadInProgress) {
      const {id} = uploadInProgress.uploadTask;
      this.setState({uploadInProgress: null});
      uploadQueueAction('dequeueUploadTask', id);
    }
  }

  getNextUploadTask(includeBackgroundTasks) {
    const {queue} = this.props.uploadQueue;
    if (queue) {
      let sorted = sortUploadTasks(Object.values(queue));
      if (!includeBackgroundTasks) {
        sorted = sorted.filter((x) => !x.isBackground);
      }
      if (sorted.length > 0) {
        return sorted[0];
      }
    }
    return null;
  }

  async manageUploads() {
    const {uploadInProgress, savedBackgroundUpload} = this.state;
    const {uploadQueueAction, connectionType} = this.props;
    const nextUserUpload = this.getNextUploadTask(false);
    const nextBackgroundUpload = this.getNextUploadTask(true);
    if (nextUserUpload) {
      if (!uploadInProgress) {
        if (!nextUserUpload.started) {
          this.startTask(nextUserUpload);
        }
      } else if (uploadInProgress.uploadTask.isBackground) {
        this.pauseUploadInProgress();
        await this.setState({
          uploadInProgress: {
            uploadTask: nextUserUpload,
            firebaseUploadTask: null,
          },
          savedBackgroundUpload: uploadInProgress,
        });
        this.startTask(nextUserUpload);
      }
    } else if (!uploadInProgress && savedBackgroundUpload) {
      await this.setState({
        uploadInProgress: savedBackgroundUpload,
        savedBackgroundUpload: null,
      });
      if (connectionType === 'wifi') {
        this.resumeUploadInProgress();
      }
    } else if (
      !uploadInProgress &&
      nextBackgroundUpload &&
      connectionType === 'wifi'
    ) {
      this.startTask(nextBackgroundUpload);
    } else if (!uploadInProgress) {
      uploadQueueAction('resetUploadQueue');
    }
  }

  async startTask(task) {
    switch (task.type) {
      case 'video': {
        await this.startVideoTask(task);
        break;
      }
      case 'image': {
        await this.startImageTask(task);
        break;
      }
      default: {
        console.log(
          'ERROR UploadManager upload task of unknown type: ',
          task.type,
        );
      }
    }
  }

  async startVideoTask(task) {
    const {uploadQueueAction, localVideoLibraryAction} = this.props;
    const {id, videoInfo, storageDestination, afterUpload} = task;
    const {firebaseUploadTask, uploadComplete} = uploadVideo(task);
    uploadQueueAction('startUploadTask', id);
    await this.setState({
      uploadInProgress: {uploadTask: task, firebaseUploadTask},
    });
    try {
      const cloudVideoUrl = await uploadComplete;
      if (afterUpload) {
        await afterUpload();
      }
      database()
        .ref()
        .update({
          [`${storageDestination}/url`]: cloudVideoUrl,
        });
      localVideoLibraryAction('deleteVideo', videoInfo.id);
    } catch (error) {
      console.log('Could not complete video upload', id, error);
    }
    this.finishUploadInProgress();
  }

  async startImageTask(task) {
    const {uploadQueueAction} = this.props;
    const {id, storageDestination} = task;
    const {firebaseUploadTask, uploadComplete} = uploadImage(task);
    uploadQueueAction('startUploadTask', id);
    await this.setState({
      uploadInProgress: {uploadTask: task, firebaseUploadTask},
    });
    try {
      const cloudImageUrl = await uploadComplete;
      database()
        .ref()
        .update({
          [`${storageDestination}/thumbnail`]: cloudImageUrl,
        });
    } catch (error) {
      console.log('Could not complete image upload', id, error);
    }
    this.finishUploadInProgress();
  }

  render() {
    return <BackgroundUploadHelper />;
  }
}

const mapStateToProps = (state) => {
  return {
    uploadQueue: state.uploadQueue,
    userID: state.user.userID,
    connectionType: state.connectionType.type,
    isConnected: state.network.isConnected,
    videoLibrary: state.localVideoLibrary.videoLibrary,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction, localVideoLibraryAction},
)(UploadManager);
