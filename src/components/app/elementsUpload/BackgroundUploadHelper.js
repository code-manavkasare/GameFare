import React, {Component} from 'react';
import {connect} from 'react-redux';
import {isEqual} from 'lodash';

import {store} from '../../../store/reduxStore';
import {uploadQueueAction} from '../../../store/actions';
import {uploadLocalVideo} from '../../functions/videoManagement';
import {boolShouldComponentUpdate} from '../../functions/redux';

class BackgroundUploadHelper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      waitForQueueToPopulate: false,
      queued: {},
    };
  }
  componentDidMount() {
    const {queue, archivesToUpload} = this.props;
    if (
      (!queue || Object.keys(queue).length === 0) &&
      this.videosAvailableToUpload(archivesToUpload).length > 0
    ) {
      this.uploadNextLocalVideo();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'BackgroundUploadHelper',
    });
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

  videosAvailableToUpload(archivesToUpload) {
    const {queued} = this.state;
    if (archivesToUpload) {
      const notQueued = Object.values(archivesToUpload).filter(
        (x) => !queued[x.id],
      );
      const notVolatile = notQueued.filter((v) => {
        return (
          store.getState().archives[v.id] &&
          !store.getState().archives[v.id].volatile &&
          (v.backgroundUpload === undefined || v.backgroundUpload === true) &&
          store.getState().archives[v.id].thumbnail !== undefined
        );
      });
      return notVolatile;
    } else {
      return [];
    }
  }

  componentDidUpdate(prevProps) {
    const {wifiAutoUpload} = this.props;
    if (
      !isEqual(this.props.archivesToUpload, prevProps.archivesToUpload) ||
      (wifiAutoUpload && wifiAutoUpload !== prevProps.wifiAutoUpload)
    ) {
      this.uploadNextLocalVideo();
    }
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
        const videosToUpload = this.videosAvailableToUpload(
          archivesToUpload,
          archives,
        );
        let newState = {};
        videosToUpload.map((video) => {
          const {id} = video;
          newState = {
            ...newState,
            waitForQueueToPopulate: true,
            queued: {...queued, [id]: true},
          };
          uploadLocalVideo(id, true);
        });
        await this.setState(newState);
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
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(BackgroundUploadHelper);
