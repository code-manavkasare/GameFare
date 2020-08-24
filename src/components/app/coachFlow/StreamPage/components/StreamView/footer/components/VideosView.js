import React, {Component} from 'react';
import {StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';

import PastSessions from './PastSessions';
import {native} from '../../../../../../../animations/animations';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class VideoViews extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaderLiveReview: false,
    };
    this.animateView = new Animated.Value(1);
  }
  componentDidMount() {
    this.props.onRef(this);
  }

  animationView() {
    const translateY = this.animateView.interpolate({
      inputRange: [0, 1],
      extrapolate: 'clamp',
      outputRange: [300, 0],
    });
    return {translateY};
  }
  sessions() {
    const {translateY} = this.animationView();
    const {
      openVideo,
      personSharingScreen,
      videoBeingShared,
      coachSessionID,
    } = this.props;

    const styleViewVideos = {
      transform: [{translateY}],
      height: 300,
      width: '100%',
      borderTopWidth: 1,
      borderColor: colors.off,
    };
    return (
      <Animated.View style={styleViewVideos}>
        <PastSessions
          openVideo={(videoData) => openVideo(videoData)}
          personSharingScreen={personSharingScreen}
          videoBeingShared={videoBeingShared}
          coachSessionID={coachSessionID}
        />
      </Animated.View>
    );
  }

  render() {
    return this.sessions();
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(VideoViews);
