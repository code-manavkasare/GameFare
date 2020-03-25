import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {SketchCanvas} from '@terrylinla/react-native-sketch-canvas';
const {height, width} = Dimensions.get('screen');
import isEqual from 'lodash.isequal';
import VideoAF from 'react-native-af-video-player';
import Video from 'react-native-video';
import firebase from 'react-native-firebase';

import VideoPlayer from './VideoPlayer';
import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
import {Col, Row} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class ShareScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
      loader: true,
    };
    this.translateXPage = new Animated.Value(
      this.props.shareScreen ? 0 : width,
    );
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    if (nextProps.shareScreen !== this.props.shareScreen)
      return this.translateXPage.setValue(nextProps.shareScreen ? 0 : width);
  }
  open(val) {
    if (val) return this.translateXPage.setValue(0);
    return this.translateXPage.setValue(width);
  }
  updateVideoInfoCloud = (paused, currentTime) => {
    const {objectID} = this.props.session;
    firebase
      .database()
      .ref(`coachSessions/${objectID}/tokbox/sharedVideo`)
      .update({paused, currentTime});
  };
  shareScreen() {
    const {shareScreen, session, personSharingScreen} = this.props;
    return (
      <Animated.View
        style={[
          styleApp.center,
          styles.page,
          {backgroundColor: colors.greyDark},
          {transform: [{translateX: this.translateXPage}]},
        ]}>
        {(shareScreen || personSharingScreen) && (
          <VideoPlayer
            sharedVideo={session.tokbox.sharedVideo}
            updateVideoInfoCloud={(paused, currentTime) => {
              this.updateVideoInfoCloud(paused, currentTime);
            }}
          />
        )}
      </Animated.View>
    );
  }
  render() {
    return this.shareScreen();
  }
}

const styles = StyleSheet.create({
  page: {
    ...styleApp.center,
    height: '100%',
    width: width,
    position: 'absolute',
    backgroundColor: colors.title,
    // opacity: 0.1,
    zIndex: 2,
  },
  backgroundVideo: {
    // position: 'absolute',
    top: 0,
    height: 300,
    width: width,
    backgroundColor: colors.blue,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    settings: state.coach.settings,
  };
};

export default connect(mapStateToProps, {coachAction})(ShareScreen);
