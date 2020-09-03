import React, {Component} from 'react';
import {connect} from 'react-redux';

import {uploadQueueAction} from '../../../actions';
import {uploadLocalVideoLazy, getLocalVideoByID} from '../../functions/videoManagement';

class BackgroundUploadHelper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      waitForQueueToPopulate: false,
      queued: {},
    };
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

  filterQueuedVideos(videoLibrary) {
    const {queued} = this.state;
    return Object.keys(videoLibrary).filter((x) => x !== 'undefined' && !queued[x]);
  }

  componentDidMount() {
    const {queue, videoLibrary} = this.props;
    if (
      (!queue || Object.keys(queue).length === 0) &&
      (videoLibrary && this.filterQueuedVideos(videoLibrary).length > 0)
    ) {
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
    //console.log('local unqueued', this.filterQueuedVideos(nextVideoLibrary));
    const nextQueueEmpty = !nextQueue || Object.keys(nextQueue).length === 0;
    const nextVideoLibraryNonEmpty =
      nextVideoLibrary && this.filterQueuedVideos(nextVideoLibrary).length > 0;
    //console.log('nextQueueEmpty, nextVideoLibraryNonEmpty', nextQueueEmpty, nextVideoLibraryNonEmpty);
    return nextQueueEmpty && nextVideoLibraryNonEmpty;
  }

  componentDidUpdate() {
    this.uploadNextLocalVideo();
  }

  async uploadNextLocalVideo() {
    const {wifiAutoUpload, videoLibrary} = this.props;
    const {queued} = this.state;
    if (wifiAutoUpload) {
      try {
        const videoID = this.filterQueuedVideos(videoLibrary)[0];
        await this.setState({
          waitForQueueToPopulate: true,
          queued: {...queued, [videoID]: true},
        });
        uploadLocalVideoLazy(getLocalVideoByID(videoID), true);
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
