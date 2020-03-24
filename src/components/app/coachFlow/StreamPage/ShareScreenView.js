import React, {Component} from 'react';
import {
  View,
  Text,
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
import YouTubePlayer from 'react-native-youtube-sdk';
import Video from 'react-native-af-video-player';

import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
import {Col, Row} from 'react-native-easy-grid';
import RNVideoHelper from 'react-native-video-helper';

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
  onBuffer(event) {
    return true;
  }
  videoError(event) {
    return true;
  }
  shareScreen() {
    const {shareScreen} = this.props;
    const archive =
      'https://s3.amazonaws.com/tokbox.com.archive2/46561852/32515991-a1a2-41ee-8ab1-cc59f5add68b/archive.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200323T072054Z&X-Amz-SignedHeaders=host&X-Amz-Expires=600&X-Amz-Credential=AKIAT5VIDVNM7GIYBDFL%2F20200323%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e2ae842035a1fb06f37250429fa20945b4d429e54b59c1a092891dc458d864dd';
    console.log('shareScreen', shareScreen);
    return (
      <Animated.View
        style={[
          styleApp.center,
          styles.page,
          {transform: [{translateX: this.translateXPage}]},
        ]}>
        {shareScreen && (
          <Video
            hideFullScreenControl={true}
            url={archive}
            style={[styleApp.fullSize]}
          />
        )}
        {/* {shareScreen && (
          <YouTubePlayer
            ref={(ref) => (this.youTubePlayer = ref)}
            videoId="hrB-_nIer88"
            autoPlay={true}
            fullscreen={false}
            showFullScreenButton={false}
            showSeekBar={true}
            showPlayPauseButton={true}
            startTime={5}
            style={{width: '100%', height: '100%'}}
            onError={(e) => console.log(e)}
            onChangeState={(e) => console.log(e)}
            onChangeFullscreen={(e) => console.log(e)}
          />
        )} */}
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
