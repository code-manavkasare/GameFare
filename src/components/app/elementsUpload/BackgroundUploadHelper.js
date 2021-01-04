import React, {Component} from 'react';
import {connect} from 'react-redux';
import equal from 'fast-deep-equal';

import {store} from '../../../store/reduxStore';
import {uploadLocalVideo} from '../../functions/videoManagement';
import {boolShouldComponentUpdate} from '../../functions/redux';
import {userConnectedSelector} from '../../../store/selectors/user';
import {wifiAutoUploadSelector} from '../../../store/selectors/appSettings';
import {queueSelector} from '../../../store/selectors/uploadQueue';
import {userLocalArchivesSelector} from '../../../store/selectors/archives';

class BackgroundUploadHelper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queuedByHelper: {},
    };
  }
  componentDidMount() {
    const {globalQueue, archivesToUpload} = this.props;
    if (
      (!globalQueue || Object.keys(globalQueue).length === 0) &&
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

  videosAvailableToUpload(archivesToUpload) {
    const {globalQueue} = this.props;
    const {queuedByHelper} = this.state;
    if (archivesToUpload) {
      const notQueued = Object.values(archivesToUpload).filter(
        (archive) =>
          !queuedByHelper[archive.id] &&
          (!globalQueue ||
            Object.values(globalQueue).filter(
              (task) => task?.cloudID === archive.id,
            ).length === 0),
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
      !equal(this.props.archivesToUpload, prevProps.archivesToUpload) ||
      (wifiAutoUpload && wifiAutoUpload !== prevProps.wifiAutoUpload)
    ) {
      this.uploadNextLocalVideo();
    }
  }

  async uploadNextLocalVideo() {
    const {queuedByHelper} = this.state;
    const {
      wifiAutoUpload,
      archivesToUpload,
      archives,
      userConnected,
    } = this.props;
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
            queuedByHelper: {...queuedByHelper, [id]: true},
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
    globalQueue: queueSelector(state),
    archivesToUpload: userLocalArchivesSelector(state),
    wifiAutoUpload: wifiAutoUploadSelector(state),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(BackgroundUploadHelper);
