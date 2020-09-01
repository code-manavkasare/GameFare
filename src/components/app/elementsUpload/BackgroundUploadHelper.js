import React, {Component} from 'react';
import {connect} from 'react-redux';

import {uploadQueueAction} from '../../../actions';
import {uploadLocalVideoLazy} from '../../functions/videoManagement';

class BackgroundUploadHelper extends Component {
  constructor(props) {
    super(props);
    this.state = {waitForQueueToPopulate: false};
  }

  static getDerivedStateFromProps(props, state) {
    const {queue} = props;
    const {waitForQueueToPopulate} = state;
    if (waitForQueueToPopulate) {
      if (queue && Object.keys(queue).length > 0) {
        return {waitForQueueToPopulate: false};
      }
    }
    return {};
  }

  componentDidMount() {
    const {queue, videoLibrary} = this.props;
    if ((!queue || Object.keys(queue).length === 0) && (videoLibrary && Object.keys(videoLibrary).length > 0)) {
      this.uploadNextLocalVideo();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // update if the queue is empty and local library non empty
    const {queue: nextQueue, videoLibrary: nextVideoLibrary} = nextProps;
    const {waitForQueueToPopulate} = nextState;
    if (waitForQueueToPopulate) {
      return false;
    }
    const nextQueueEmpty = (!nextQueue || Object.keys(nextQueue).length === 0);
    const nextVideoLibraryNonEmpty = (nextVideoLibrary && Object.values(nextVideoLibrary).length > 0);
    return nextQueueEmpty && nextVideoLibraryNonEmpty;
  }

  componentDidUpdate() {
    this.uploadNextLocalVideo();
  }

  async uploadNextLocalVideo() {
    const {wifiAutoUpload, videoLibrary} = this.props;
    if (wifiAutoUpload) {
      try {
        const video = Object.values(videoLibrary)[0];
        await this.setState({waitForQueueToPopulate: true});
        uploadLocalVideoLazy(video, null, true);
      } catch (error) {
        console.log('ERROR BackgroundUploadHelper', error);
      }
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    queue: state.uploadQueue.queue,
    videoLibrary: state.localVideoLibrary.videoLibrary,
    wifiAutoUpload: state.appSettings.wifiAutoUpload,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(BackgroundUploadHelper);
