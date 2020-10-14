import React, {Component} from 'react';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {uploadQueueAction} from '../../../actions';
import {uploadFile, sortUploadTasks} from '../../functions/upload';
import BackgroundUploadHelper from './BackgroundUploadHelper';
import {updateLocalUploadProgress} from '../../functions/videoManagement';
import {updateCloudUploadProgress} from '../../database/firebase/videosManagement';

class UploadManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadInProgress: null,
      savedBackgroundUpload: null,
      lastProgressUpdateTime: Date.now(),
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
      lastDeletedArchiveIds,
      uploadQueue: prevUploadQueue,
    } = prevProps;

    if (lastDeletedArchiveIds) {
      for (const id of lastDeletedArchiveIds) {
        this.cancelUploadWhenLocalArchiveDeleted(id);
      }
    }

    const {isConnected, connectionType, uploadQueue} = this.props;
    const {uploadInProgress} = this.state;
    const {queue} = uploadQueue;
    const {queue: prevQueue} = prevUploadQueue;
    const lostConnection = prevIsConnected && !isConnected;
    const lostWifi = connectionType !== 'wifi' && prevConnectionType === 'wifi';
    const gainedWifi =
      connectionType === 'wifi' && prevConnectionType !== 'wifi';
    if (uploadInProgress) {
      const isBackground =
        queue[(uploadInProgress?.uploadTask?.id)]?.isBackground;
      const prevIsBackground =
        prevQueue[(uploadInProgress?.uploadTask?.id)]?.isBackground;
      const forceStart =
        !isBackground &&
        (prevIsBackground === undefined || prevIsBackground === true);
      if (lostConnection || (isBackground && lostWifi)) {
        this.pauseUploadInProgress();
      } else if (gainedWifi || forceStart) {
        this.manageUploads(forceStart);
        // this.resumeUploadInProgress();
      }
    } else if (isConnected) {
      this.manageUploads();
    }
  }

  cancelUploadWhenLocalArchiveDeleted = (id) => {
    const {uploadInProgress} = this.state;
    if (uploadInProgress) {
      const {cloudID} = uploadInProgress.uploadTask;
      if (cloudID === id) {
        this.state.uploadInProgress.firebaseUploadTask.cancel();
      }
    }
  };

  onProgress(progress) {
    const {uploadInProgress, lastProgressUpdateTime} = this.state;
    const {uploadQueueAction} = this.props;
    if (uploadInProgress) {
      const {uploadTask} = uploadInProgress;
      if (uploadTask && progress) {
        const {videoInfo, progress: prevProgress} = uploadTask;
        const now = Date.now();
        const id = videoInfo?.id;
        if (id && (now - lastProgressUpdateTime > 1000 || prevProgress === 0)) {
          let newUploadTask = {...uploadTask, progress};
          this.setState({
            lastProgressUpdateTime: now,
            uploadInProgress: {...uploadInProgress, uploadTask: newUploadTask},
          });
          updateCloudUploadProgress(id, progress);
          updateLocalUploadProgress(id, progress);
          uploadQueueAction('setUploadTaskProgress', newUploadTask);
        }
      }
    }
  }

  resumeUploadInProgress() {
    const {uploadInProgress} = this.state;
    const {uploadQueueAction} = this.props;
    if (uploadInProgress) {
      const {uploadTask, firebaseUploadTask} = uploadInProgress;
      uploadQueueAction('resumeUploadTask', uploadTask.id);
      const resumed = firebaseUploadTask?.resume();
      if (!resumed) {
        console.log('upload task resume had no effect');
      } else {
        console.log('upload task resumed');
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

  async manageUploads(forceStart) {
    const {uploadInProgress, savedBackgroundUpload} = this.state;
    const {uploadQueueAction, connectionType} = this.props;
    const nextUserUpload = this.getNextUploadTask(false);
    const nextBackgroundUpload = this.getNextUploadTask(true);
    if (nextUserUpload) {
      if (!uploadInProgress || !uploadInProgress?.firebaseUploadTask) {
        if (!nextUserUpload.started) {
          await this.setState({
            uploadInProgress: {
              uploadTask: nextUserUpload,
              firebaseUploadTask: null,
            },
          });
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
      !nextBackgroundUpload.started &&
      connectionType === 'wifi'
    ) {
      this.startTask(nextBackgroundUpload);
    } else if (!uploadInProgress && !nextBackgroundUpload) {
      uploadQueueAction('resetUploadQueue');
    } else if (forceStart && nextBackgroundUpload) {
      this.startTask(nextBackgroundUpload);
    }
  }

  async startTask(task) {
    await this.startFileTask(task);
  }

  async startFileTask(task) {
    const {uploadQueueAction} = this.props;
    const {id, storageDestination, afterUpload, type} = task;
    const {firebaseUploadTask, uploadComplete} = uploadFile({
      ...task,
      onProgress: (progress) =>
        type === 'video' ? this.onProgress(progress) : null,
    });
    uploadQueueAction('startUploadTask', id);
    await this.setState({
      uploadInProgress: {uploadTask: task, firebaseUploadTask},
    });
    try {
      const cloudFileUrl = await uploadComplete;

      let typeDestination = '';
      switch (type) {
        case 'video':
          typeDestination = 'url';
          break;
        case 'image':
          typeDestination = 'thumbnail';
          break;
        case 'audioRecord':
          typeDestination = 'audioRecord';
          break;
        default:
          console.log(
            `${type} is not a valid type, check UploadManager.js>startFileTask()`,
          );
      }
      await database()
        .ref()
        .update({
          [`${storageDestination}/${typeDestination}`]: cloudFileUrl,
        });
      if (afterUpload) {
        await afterUpload(cloudFileUrl);
      }
    } catch (error) {
      console.log('Could not complete file upload', id, error);
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
    // connectionType: 'cellular',
    isConnected: state.network.isConnected,
    videoLibrary: state.localVideoLibrary.videoLibrary,
    lastDeletedArchiveIds: state.localVideoLibrary.lastDeletedArchiveIds,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(UploadManager);
