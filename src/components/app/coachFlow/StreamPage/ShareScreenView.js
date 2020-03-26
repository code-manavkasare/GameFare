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
import DrawView from './DrawView';
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
      this.props.shareScreen || this.props.personSharingScreen ? 0 : width,
    );
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.shareScreen !== this.props.shareScreen ||
      nextProps.personSharingScreen !== this.props.personSharingScreen
    )
      return this.translateXPage.setValue(
        nextProps.shareScreen || nextProps.personSharingScreen ? 0 : width,
      );
  }
  open(val) {
    if (val) return this.translateXPage.setValue(0);
    return this.translateXPage.setValue(width);
  }
  updateVideoInfoCloud = (paused, currentTime, videoID) => {
    const {objectID} = this.props.session;
    firebase
      .database()
      .ref(`coachSessions/${objectID}/sharedVideos/${videoID}`)
      .update({paused, currentTime});
  };

  shareScreen() {
    const {shareScreen, session, personSharingScreen, videoID} = this.props;

    const video = session.sharedVideos[videoID];
    console.log('share screeen view', personSharingScreen, shareScreen);
    return (
      <Animated.View
        style={[
          styles.page,
          {backgroundColor: colors.greyDark},
          {transform: [{translateX: this.translateXPage}]},
        ]}>
        {(shareScreen || personSharingScreen) && (
          <VideoPlayer
            source={video.source}
            paused={video.paused}
            currentTime={video.currentTime}
            componentOnTop={() => (
              <DrawView
                coachSessionID={session.objectID}
                videoID={videoID}
                video={video}
                shareScreen={shareScreen}
                drawingOpen={shareScreen || personSharingScreen}
              />
            )}
            styleContainerVideo={[styleApp.center, styleApp.stylePage]}
            styleVideo={[styleApp.fullSize, {width: width}]}
            updateVideoInfoCloud={(paused, currentTime) => {
              this.updateVideoInfoCloud(paused, currentTime, videoID);
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
    height: height,
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
