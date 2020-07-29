import React, {Component} from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {RNCamera} from 'react-native-camera';
import {Col, Row} from 'react-native-easy-grid';
import styleApp from '../style/style';
import colors from '../style/colors';
import sizes from '../style/sizes';
import Orientation from 'react-native-orientation-locker';
import StatusBar from '@react-native-community/status-bar';

import {getVideoInfo} from '../functions/pictures';
import {
  addVideo,
  makeVideoFlag,
  addVideoWithFlags,
} from '../functions/videoManagement';
import {layoutAction} from '../../actions/layoutActions';

import BottomButtons from './components/BottomButtons';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraReady: false,
      isRecording: false,
      promiseRecording: null,
      frontCamera: false,
      startRecordingTime: null,
      flags: [],
    };
    this.camera = null;
    this.animatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {navigation, layoutAction} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
      layoutAction('setLayout', {isFooterVisible: false});
      StatusBar.setBarStyle('light-content', true);
    });
    this.blurListener = navigation.addListener('blur', () => {
      layoutAction('setLayout', {isFooterVisible: true});
      StatusBar.setBarStyle('dark-content', true);
    });
  }
  shouldComponentUpdate(prevProps, prevState) {
    return (
      prevState.cameraReady != this.state.cameraReady ||
      prevState.frontCamera != this.state.frontCamera
    );
  }
  addFlag() {
    const {isRecording, startRecordingTime, flags} = this.state;
    if (isRecording) {
      const flagTimestamp = Date.now() - startRecordingTime;
      console.log(flagTimestamp);
      let newFlags = flags.concat(flagTimestamp);
      this.setState({flags: newFlags});
    }
  }
  startRecording() {
    if (this.camera) {
      const options = {
        quality: RNCamera.Constants.VideoQuality['720p'],
      };
      let promise = this.camera.recordAsync(options);
      this.setState({
        isRecording: true,
        promiseRecording: promise,
        startRecordingTime: Date.now(),
        flags: [],
      });
    }
  }
  async stopRecording(saveVideo) {
    if (this.camera && this.state.isRecording) {
      const {promiseRecording} = this.state;
      this.camera.stopRecording();
      this.setState({isRecording: false, startRecordingTime: null});
      if (saveVideo) {
        this.saveRecording(await promiseRecording);
      }
      this.setState({promiseRecording: null});
    }
  }
  async saveRecording(recording) {
    const {flags} = this.state;
    const videoInfo = await getVideoInfo(recording.uri, true);
    if (flags.length > 0) {
      const flagObjects = flags.map((timestamp) =>
        makeVideoFlag(timestamp, videoInfo),
      );
      console.log('flagObjects', flagObjects);
      addVideoWithFlags(videoInfo, flagObjects);
    } else {
      addVideo(videoInfo);
    }
  }
  close() {
    this.stopRecording(false);
    const {layoutAction, navigation} = this.props;
    layoutAction('setLayout', {isFooterVisible: true});
    // navigation.navigate('VideoLibrary');
    navigation.goBack();
  }
  render() {
    const {cameraReady, frontCamera} = this.state;
    return (
      <View style={styles.container}>
        <RNCamera
          onCameraReady={() => this.setState({cameraReady: true})}
          onMountError={(error) => console.log('RNCamera mount error: ', error)}
          onStatusChange={(status) =>
            console.log('RNCamera status change: ', status)
          }
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={
            frontCamera
              ? RNCamera.Constants.Type.front
              : RNCamera.Constants.Type.back
          }
          flashMode={RNCamera.Constants.FlashMode.off}
          pictureSize={'1280x720'} // this prop stops flickering when stop and start recording
        />
        <HeaderBackButton
          AnimatedHeaderValue={this.animatedHeaderValue}
          inputRange={[5, 10]}
          colorLoader={'white'}
          sizeLoader={40}
          initialBorderColorIcon={'transparent'}
          initialTitleOpacity={0}
          icon1={'arrow-left'}
          typeIcon1="font"
          backgroundColorIcon1={colors.title + '70'}
          clickButton1={() => this.close()}
          nobackgroundColorIcon1={true}
          sizeIcon1={18}
          colorIcon1={colors.white}
          icon2={'switchCam'}
          backgroundColorIcon2={colors.title + '70'}
          clickButton2={() => this.setState({frontCamera: !frontCamera})}
          sizeIcon2={20}
          typeIcon2="moon"
          colorIcon2={colors.white}
        />
        {cameraReady && (
          <Row style={styles.recordButtonContainer}>
            <BottomButtons
              addFlag={() => this.addFlag()}
              startRecording={() => this.startRecording()}
              stopRecording={() => this.stopRecording(true)}
            />
          </Row>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  recordButtonContainer: {
    position: 'absolute',
    bottom: 0,
    height: sizes.heightFooter + sizes.marginBottomApp,
    paddingTop: 0,
    width: '100%',
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  viewRecordingTime: {
    width: '100%',
    height: 32,
    borderRadius: 5,
    paddingLeft: 5,
    paddingRight: 5,
    ...styleApp.center,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Camera);
