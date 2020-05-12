import React, {Component} from 'react';
import {StyleSheet, Animated} from 'react-native';

import {connect} from 'react-redux';

import BottomButtons from './components/BottomButtons';
import VideosView from './components/VideosView';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  getVideoUploadStatus() {
    return this.bottomButtonRef.getVideoUploadStatus();
  }
  shouldComponentUpdate = (nextProps) => {
    return (
      nextProps.videoBeingShared.id !== this.props.videoBeingShared.id ||
      nextProps.personSharingScreen !== this.props.personSharingScreen
    );
  };
  footer() {
    const {
      setState,
      translateYFooter,
      watchVideoRef,
      endCoachSession,
      opacityHeader,
      personSharingScreen,
      videoBeingShared,
      otPublisherRef,
    } = this.props;
    return (
      <Animated.View
        style={[
          styles.footer,
          {opacity: opacityHeader},
          {transform: [{translateY: translateYFooter}]},
        ]}>
        <BottomButtons
          setState={setState}
          personSharingScreen={personSharingScreen}
          videoBeingShared={videoBeingShared}
          endCoachSession={endCoachSession}
          onRef={(ref) => (this.bottomButtonRef = ref)}
          clickReview={(val) => this.pastSessionsRef.open(val)}
          otPublisherRef={otPublisherRef}
        />

        <VideosView
          setState={setState}
          personSharingScreen={personSharingScreen}
          videoBeingShared={videoBeingShared}
          onRef={(ref) => (this.pastSessionsRef = ref)}
          openVideo={(data) => watchVideoRef.open(data)}
        />
      </Animated.View>
    );
  }
  render() {
    return this.footer();
  }
}

const styles = StyleSheet.create({
  footer: {
    bottom: 0,
    width: '100%',
    position: 'absolute',
    flex: 1,
    zIndex: 5,
  },
  cameraView: {
    height: 120,
    width: 90,
    borderRadius: 6,
    backgroundColor: 'red',
    position: 'absolute',
    overflow: 'hidden',
    top: -140,
    left: 20,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {},
)(Footer);
