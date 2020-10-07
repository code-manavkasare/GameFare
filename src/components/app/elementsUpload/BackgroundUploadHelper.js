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

  videosAvailableToUpload(archivesToUpload, archives) {
    const {queued} = this.state;
    if (archivesToUpload) {
      const notQueued = Object.values(archivesToUpload).filter(
        (x) => !queued[x.id],
      );
      const notVolatile = notQueued.filter(
        (v) => archives[v.id] && !archives[v.id].volatile,
      );
      return notVolatile;
    } else {
      return [];
    }
  }

  componentDidMount() {
    const {queue, archivesToUpload, archives} = this.props;
    if (
      (!queue || Object.keys(queue).length === 0) &&
      this.videosAvailableToUpload(archivesToUpload, archives).length > 0
    ) {
      this.uploadNextLocalVideo();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // update if the queue is empty and local library non empty AND not currently in a live session
    const {
      queue: nextQueue,
      archivesToUpload: nextArchivesToUpload,
      archives: nextArchives,
    } = nextProps;
    const {waitForQueueToPopulate} = nextState;
    if (waitForQueueToPopulate) {
      return false;
    }
    const nextQueueEmpty = !nextQueue || Object.keys(nextQueue).length === 0;
    const nextArchivesNonEmpty =
      nextArchivesToUpload &&
      this.videosAvailableToUpload(nextArchivesToUpload, nextArchives).length >
        0;
    return nextQueueEmpty && nextArchivesNonEmpty && !nextProps.session;
  }

  componentDidUpdate() {
    this.uploadNextLocalVideo();
  }

  async uploadNextLocalVideo() {
    const {
      wifiAutoUpload,
      archivesToUpload,
      archives,
      userConnected,
    } = this.props;
    const {queued} = this.state;
    if (wifiAutoUpload && userConnected) {
      try {
        const {id} = this.videosAvailableToUpload(
          archivesToUpload,
          archives,
        )[0];
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
    archives: state.archives,
    queue: state.uploadQueue.queue,
    archivesToUpload: state.localVideoLibrary.userLocalArchives,
    wifiAutoUpload: state.appSettings.wifiAutoUpload,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(BackgroundUploadHelper);
