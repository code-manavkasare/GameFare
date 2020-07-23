import React, {Component} from 'react';
import {StyleSheet, Animated} from 'react-native';

import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import BottomButtons from './components/BottomButtons';
import VideosView from './components/VideosView';
import {native} from '../../../../../../animations/animations';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  shouldComponentUpdate = (nextProps) => {
    return (
      nextProps.videoBeingShared.id !== this.props.videoBeingShared.id ||
      nextProps.personSharingScreen !== this.props.personSharingScreen ||
      !isEqual(nextProps.members, this.props.members)
    );
  };
  openPastSessions(val) {
    let {translateYFooter} = this.props
    Animated.parallel([
      Animated.timing(translateYFooter, native(val ? 1 : 0, 200)),
    ]).start();
    this.pastSessionsRef.open(val)
  }
  footer() {
    const {
      setState,
      translateYFooter,
      watchVideoRef,
      personSharingScreen,
      videoBeingShared,
      otPublisherRef,
      members,
      publishVideo,
      publishAudio
    } = this.props;
    const translateY = translateYFooter.interpolate({
      inputRange: [0, 1],
      extrapolate: 'clamp',
      outputRange: [170, 0],
    });
    return (
      <Animated.View
        style={[
          styles.footer,
          {transform: [{translateY}]},
        ]}>
        <BottomButtons
          setState={setState}
          personSharingScreen={personSharingScreen}
          videoBeingShared={videoBeingShared}
          onRef={(ref) => (this.bottomButtonRef = ref)}
          clickReview={(val) => this.openPastSessions(val)}
          otPublisherRef={otPublisherRef}
          members={members}
          publishVideo={publishVideo}
          publishAudio={publishAudio}
          coachSessionID={this.props.coachSessionID}
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
    zIndex: 11,
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
