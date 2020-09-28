import React, {Component} from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {RNCamera} from 'react-native-camera';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

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
  static propTypes = {
    onRef: PropTypes.func,
    frontCamera: PropTypes.bool,
    onCameraReady: PropTypes.func,
    onRecord: PropTypes.func,
    onStopRecord: PropTypes.func,
  };
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
    onRef && onRef(null);
  }
  giveRef() {
    const {onRef} = this.props;
    onRef && onRef(this);
  }
  shouldComponentUpdate(prevProps, prevState) {
    return (
      prevState.cameraReady != this.state.cameraReady ||
      prevProps.frontCamera != this.props.frontCamera ||
      prevState.isRecording != this.state.isRecording
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
  async startRecording(callback) {
    const {layoutAction, onRecord} = this.props;
    const {camera, state} = this;
    const {isRecording} = state;
    if (camera && !isRecording) {
      layoutAction('setGeneralSessionRecording', true);
      this.setState({isRecording: true});
      const options = {
        quality: RNCamera.Constants.VideoQuality['2160p'],
      };
      let promise = camera.recordAsync(options);
      onRecord && onRecord();
      promise.catch((e) => {
        console.log(e);
        layoutAction('setGeneralSessionRecording', false);
        this.setState({
          promiseRecording: null,
          isRecording: false,
          startRecordingTime: null,
        });
        if (callback?.onError) {
          callback.onError();
        }
        this.startRecording(callback);
      });
      this.setState({promiseRecording: promise});
      if (callback?.onSuccess) {
        callback.onSuccess(Date.now());
      }
    }
  }
  async stopRecording(saveVideo) {
    const {layoutAction, onStopRecord} = this.props;
    const {camera, state} = this;
    const {promiseRecording, isRecording} = state;
    if (camera && isRecording) {
      layoutAction('setGeneralSessionRecording', false);
      await camera.stopRecording();
      onStopRecord && onStopRecord();
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
    console.log('RECORDING', recording);
    let videoInfo = await getVideoInfo(recording.uri);
    await addLocalVideo(videoInfo);
    openVideoPlayer({
      archives: [videoInfo.id],
      open: true,
    });
  }
  render() {
    const {frontCamera, onCameraReady} = this.props;
    const {isRecording} = this.state;
    return (
      <View style={styleApp.flexColumnBlack}>
        <RNCamera
          onCameraReady={() => {
            this.setState({cameraReady: true});
            if (onCameraReady) {
              onCameraReady(true);
            }
          }}
          onMountError={(error) =>
            console.log('RNCamera mount error: ', error)
          }
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
          captureAudio={isRecording}
          keepAudioSession
          mixWithOthers
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
