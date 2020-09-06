import React, {Component} from 'react';
import {connect} from 'react-redux';

import {uploadQueueAction} from '../../../actions';
import {uploadLocalVideo} from '../../functions/videoManagement';

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

  videosAvailableToUpload(archives) {
    const {queued} = this.state;
    if (archives) {
      return Object.values(archives).filter((x) => x && x.local && !queued[x.id]);
    } else {
      return [];
    }
  }

  componentDidMount() {
    const {queue, archives} = this.props;
    if (
      (!queue || Object.keys(queue).length === 0) &&
      (this.videosAvailableToUpload(archives).length > 0)
    ) {
      this.uploadNextLocalVideo();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // update if the queue is empty and local library non empty
    const {queue: nextQueue, archives: nextArchives} = nextProps;
    const {waitForQueueToPopulate} = nextState;
    if (waitForQueueToPopulate) {
      return false;
    }
    //console.log('local unqueued', this.filterQueuedVideos(nextVideoLibrary));
    const nextQueueEmpty = !nextQueue || Object.keys(nextQueue).length === 0;
    const nextArchivesNonEmpty =
      nextArchives && this.videosAvailableToUpload(nextArchives).length > 0;
    //console.log('nextQueueEmpty, nextVideoLibraryNonEmpty', nextQueueEmpty, nextVideoLibraryNonEmpty);
    return nextQueueEmpty && nextArchivesNonEmpty;
  }

  componentDidUpdate() {
    this.uploadNextLocalVideo();
  }

  async uploadNextLocalVideo() {
    const {wifiAutoUpload, archives} = this.props;
    const {queued} = this.state;
    if (wifiAutoUpload) {
      try {
        const video = this.videosAvailableToUpload(archives)[0];
        await this.setState({
          waitForQueueToPopulate: true,
          queued: {...queued, [video.id]: true},
        });
        uploadLocalVideo(video.id, true);
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
    archives: state.archives,
    wifiAutoUpload: state.appSettings.wifiAutoUpload,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(BackgroundUploadHelper);
