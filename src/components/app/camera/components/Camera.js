import React, {Component} from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {RNCamera} from 'react-native-camera';
import {Col, Row} from 'react-native-easy-grid';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';
import {layoutAction} from '../../../../actions/layoutActions';

import {getVideoInfo, getNewVideoSavePath} from '../../../functions/pictures';
import {
  addLocalVideo,
  openVideoPlayer,
} from '../../../functions/videoManagement';

class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraReady: false,
      isRecording: false,
      promiseRecording: null,
      startRecordingTime: null,
      flags: [],
    };
    this.camera = null;
  }
  holdRef() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(null);
    }
  }
  giveRef() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(this);
    }
  }
  shouldComponentUpdate(prevProps, prevState) {
    return (
      prevState.cameraReady != this.state.cameraReady ||
      prevProps.frontCamera != this.props.frontCamera
    );
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.cameraReady && !this.state.cameraReady) {
      this.holdRef();
    }
    if (!prevState.cameraReady && this.state.cameraReady) {
      this.giveRef();
    }
  }
  addFlag() {
    const {isRecording, startRecordingTime, flags} = this.state;
    if (isRecording) {
      const flagTimestamp = Date.now() - startRecordingTime;
      const newFlags = flags.concat(flagTimestamp);
      this.setState({flags: newFlags});
    }
  }
  startRecording() {
    const {layoutAction} = this.props;
    const {camera, state} = this;
    const {isRecording} = state;
    if (camera && !isRecording) {
      layoutAction('setGeneralSessionRecording', true);
      this.setState({isRecording: true});
      const options = {
        path: getNewVideoSavePath(),
        quality: RNCamera.Constants.VideoQuality['720p'],
      };
      let promise = camera.recordAsync(options);
      this.setState({
        promiseRecording: promise,
        startRecordingTime: Date.now(),
        flags: [],
      });
    }
  }
  async stopRecording(saveVideo) {
    const {layoutAction} = this.props;
    const {camera, state} = this;
    const {promiseRecording, isRecording} = state;
    if (camera && isRecording) {
      layoutAction('setGeneralSessionRecording', false);
      await camera.stopRecording();
      if (saveVideo) {
        this.saveRecording(await promiseRecording);
      }
      this.setState({
        promiseRecording: null,
        isRecording: false,
        startRecordingTime: null,
      });
    }
  }
  async saveRecording(recording) {
    let videoInfo = await getVideoInfo(recording.uri);
    addLocalVideo(videoInfo);
    openVideoPlayer({
      archives: [videoInfo.id],
      open: true,
    });
  }
  render() {
    const {frontCamera, onCameraReady} = this.props;
    return (
      <View style={styleApp.flexColumnBlack}>
        <RNCamera
          onCameraReady={() => {
            this.setState({cameraReady: true});
            if (onCameraReady) {
              onCameraReady(true);
            }
          }}
          onMountError={(error) => console.log('RNCamera mount error: ', error)}
          onStatusChange={(status) => {
            if (status.cameraStatus !== 'READY') {
              this.setState({cameraReady: false});
              if (onCameraReady) {
                onCameraReady(false);
              }
            }
          }}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Camera);
