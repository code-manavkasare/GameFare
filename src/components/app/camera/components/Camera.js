import React, {Component} from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {RNCamera} from 'react-native-camera';
import {Col, Row} from 'react-native-easy-grid';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';

import {getVideoInfo} from '../../../functions/pictures';
import {addVideo, openVideoPlayer} from '../../../functions/videoManagement';

export default class Camera extends Component {
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
      console.log('camera give ref');
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
    const {camera, state} = this;
    const {isRecording} = state;
    if (camera && !isRecording) {
      this.setState({isRecording: true});
      const options = {
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
    const {camera, state} = this;
    const {promiseRecording, isRecording} = state;
    if (camera && isRecording) {
      await camera.stopRecording();
      if (saveVideo) {
        this.saveRecording(await promiseRecording);
      }
      this.setState({promiseRecording: null, isRecording: false, startRecordingTime: null});
    }
  }
  async saveRecording(recording) {
    const {flags} = this.state;
    let videoInfo = await getVideoInfo(recording.uri, true);
    if (flags.length > 0) {
      videoInfo = {...videoInfo, flags};
      this.setState({flags: []});
    }
    addVideo(videoInfo);
    openVideoPlayer(videoInfo, true);
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
