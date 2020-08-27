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
    const {status} = this.props.uploadQueue;
    if (status === 'uploading') {
      this.processQueue(true);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {status} = this.props.uploadQueue;
    if (status === 'uploading') {
      this.processQueue(false);
    }
  }

  async processQueue(init) {
    const {uploadQueueAction} = this.props;
    const {pool} = this.props.uploadQueue;
    if (pool && Object.values(pool).length > 0) {
      const sorted = Object.values(pool).sort((a, b) => a.timeSubmitted - b.timeSubmitted);
      const next = sorted[0];
      console.log('sorted', sorted.map(x => x.id));
      if (!next.progress || init) {
        await uploadQueueAction('setJobProgress', {
          id: next.id,
          progress: 0.01,
        });
        await this.processTask(next);
      }
    } else {
      console.log('reset');
      uploadQueueAction('resetUploadQueue');
    }
  }

  async processTask(task) {
    console.log('process task', task.id, task.type);
    switch (task.type) {
      case 'video': {
        await this.processVideoTask(task);
        break;
      }
      case 'image': {
        await this.processImageTask(task);
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

  async processVideoTask(task) {
    const {uploadQueueAction, localVideoLibraryAction} = this.props;
    const {videoInfo, storageDestination} = task;
    const videoUrl = await uploadVideo(task, uploadQueueAction);
    uploadQueueAction('setJobProgress', {id: task.id, progress: 1});
    localVideoLibraryAction('deleteVideo', videoInfo.id);
    database()
      .ref()
      .update({
        [`${storageDestination}/url`]: videoUrl,
      });
    this.completeTask(task);
  }

  async processImageTask(task) {
    const {storageDestination, url} = task;
    const imageUrl = await uploadImage(url, storageDestination, 'image.jpg');
    uploadQueueAction('setJobProgress', {id: task.id, progress: 1});
    database()
      .ref()
      .update({
        [`${storageDestination}/thumbnail`]: imageUrl,
      });
    this.completeTask(task);
  }

  completeTask(task) {
    console.log('complete task', task.id);
    const {uploadQueueAction} = this.props;
    uploadQueueAction('dequeueFileUpload', task.id);
  }
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
