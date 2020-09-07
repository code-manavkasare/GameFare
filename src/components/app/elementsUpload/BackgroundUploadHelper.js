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
      return Object.values(archives).filter((x) => !queued[x.id]);
    } else {
      return [];
    }
  }

  componentDidMount() {
    const {queue, archivesToUpload} = this.props;
    if (
      (!queue || Object.keys(queue).length === 0) &&
      (this.videosAvailableToUpload(archivesToUpload).length > 0)
    ) {
      this.uploadNextLocalVideo();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // update if the queue is empty and local library non empty AND not currently in a live session
    const {queue: nextQueue, archivesToUpload: nextArchivesToUpload} = nextProps;
    const {waitForQueueToPopulate} = nextState;
    if (waitForQueueToPopulate) {
      return false;
    }
    const nextQueueEmpty = !nextQueue || Object.keys(nextQueue).length === 0;
    const nextArchivesNonEmpty =
      nextArchivesToUpload && this.videosAvailableToUpload(nextArchivesToUpload).length > 0;
    return nextQueueEmpty && nextArchivesNonEmpty && !nextProps.session;
  }

  componentDidUpdate() {
    this.uploadNextLocalVideo();
  }

  async uploadNextLocalVideo() {
    const {wifiAutoUpload, archivesToUpload} = this.props;
    const {queued} = this.state;
    if (wifiAutoUpload) {
      try {
        const {id} = this.videosAvailableToUpload(archivesToUpload)[0];
        await this.setState({
          waitForQueueToPopulate: true,
          queued: {...queued, [id]: true},
        });
        uploadLocalVideo(id, true);
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
    session: state.coachSessions[state.coach.currentSessionID],
    queue: state.uploadQueue.queue,
    archivesToUpload: state.localVideoLibrary.userLocalArchives,
    wifiAutoUpload: state.appSettings.wifiAutoUpload,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(BackgroundUploadHelper);
