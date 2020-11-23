import React, {Component} from 'react';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {uploadQueueAction} from '../../../store/actions';
import {
  getCurrentUploadingTask,
  uploadFile,
  sortUploadTasks,
} from '../../functions/upload';
import BackgroundUploadHelper from './BackgroundUploadHelper';
import {updateLocalUploadProgress} from '../../functions/videoManagement';
import {updateCloudUploadProgress} from '../../database/firebase/videosManagement';
import {afterUpload} from '../../functions/upload.js';
import {boolShouldComponentUpdate} from '../../functions/redux';

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
      this.restartUploadInProgress();
      this.manageUploads();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'UploadManager',
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
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
    const wifiConnected = connectionType === 'wifi';
    const lostWifi = !wifiConnected && prevConnectionType === 'wifi';
    const gainedWifi =
      wifiConnected &&
      prevConnectionType !== 'unknown' &&
      prevConnectionType !== 'wifi';
    if (uploadInProgress) {
      const isBackground =
        queue[(uploadInProgress?.uploadTask?.id)]?.isBackground;
      const prevIsBackground =
        prevQueue[(uploadInProgress?.uploadTask?.id)]?.isBackground;
      const forceStart =
        !isBackground &&
        (prevIsBackground === undefined || prevIsBackground === true);
      if (isBackground && lostWifi) {
        return this.pauseUploadInProgress();
      } else if (gainedWifi || forceStart) {
        return this.manageUploads(true);
      } else if (isBackground && !wifiConnected) {
        return this.manageUploads();
      }
    } else if (isConnected) {
      return this.manageUploads();
    }
  }

  cancelUploadWhenLocalArchiveDeleted = (id) => {
    const {uploadInProgress} = this.state;
    if (uploadInProgress) {
      const {cloudID} = uploadInProgress.uploadTask;
      if (cloudID === id) {
        this.state.uploadInProgress?.firebaseUploadTask?.cancel();
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

  restartUploadInProgress = () => {
    const {queue} = this.props.uploadQueue;
    const currentUpload = getCurrentUploadingTask(queue);
    if (currentUpload) {
      console.log('STARTING TASK --- restart upload in progress');
      this.startTask(currentUpload);
    }
  };

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
          console.log('STARTING TASK --- next user upload');
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
        console.log('STARTING TASK --- interrupt background upload task');
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
      console.log('STARTING TASK --- next background upload');
      this.startTask(nextBackgroundUpload);
    } else if (!uploadInProgress && !nextBackgroundUpload) {
      uploadQueueAction('resetUploadQueue');
    } else if (forceStart && nextBackgroundUpload) {
      console.log('STARTING TASK --- force start background upload');
      this.startTask(nextBackgroundUpload);
    }
  }

  async startTask(task) {
    await this.startFileTask(task);
  }

  async startFileTask(task) {
    const {uploadQueueAction} = this.props;
    const {id, storageDestination, type} = task;
    const {firebaseUploadTask, uploadComplete} = uploadFile({
      ...task,
      onProgress: (progress) =>
        type === 'video' ? this.onProgress(progress) : null,
    });
    console.log('startFileTask', task);
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
          typeDestination = 'audioRecordUrl';
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
      await afterUpload(task, cloudFileUrl);
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
    isConnected: state.network.isConnected,
    videoLibrary: state.localVideoLibrary.videoLibrary,
    lastDeletedArchiveIds: state.localVideoLibrary.lastDeletedArchiveIds,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(UploadManager);
