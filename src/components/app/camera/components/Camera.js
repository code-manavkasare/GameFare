import React, {Component} from 'react';
import {StyleSheet, View, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {RNCamera} from 'react-native-camera';
import PropTypes from 'prop-types';
import {BlurView} from '@react-native-community/blur';
import queue, {Worker} from 'react-native-job-queue';

import {native} from '../../../animations/animations';
import styleApp from '../../../style/style';

import {layoutAction} from '../../../../actions/layoutActions';

import {getVideoInfo} from '../../../functions/pictures';
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
      placeholderImg: undefined,
      displayPlaceholder: false,
      flags: [],
    };
    this.camera = null;
    this.placeholderAnimation = {
      mirror: new Animated.Value(0),
      opacity: new Animated.Value(0),
    };
  }
  holdRef() {
    const {onRef} = this.props;
    onRef && onRef(null);
  }
  giveRef() {
    const {onRef} = this.props;
    onRef && onRef(this);
  }
  componentDidMount() {
    this.configureQueue();
  }
  configureQueue() {
    queue.removeWorker('hideCamera');
    queue.removeWorker('showCamera');
    queue.addWorker(new Worker('hideCamera', this.hideCamera.bind(this)));
    queue.addWorker(new Worker('showCamera', this.showCamera.bind(this)));
  }
  shouldComponentUpdate(prevProps, prevState) {
    return (
      prevState.cameraReady !== this.state.cameraReady ||
      prevProps.frontCamera !== this.props.frontCamera ||
      prevState.isRecording !== this.state.isRecording ||
      prevProps.cameraAvailability !== this.props.cameraAvailability ||
      prevState.placeholderImg !== this.state.placeholderImg ||
      prevState.displayPlaceholder !== this.state.displayPlaceholder
    );
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.cameraReady && !this.state.cameraReady) {
      this.holdRef();
    }
    if (!prevState.cameraReady && this.state.cameraReady) {
      this.giveRef();
    }
    if (prevProps.cameraAvailability !== this.props.cameraAvailability) {
      const {cameraAvailability} = this.props;
      if (cameraAvailability) {
        queue.addJob('showCamera');
      } else {
        queue.addJob('hideCamera');
      }
    }
  }
  async hideCamera() {
    const {isRecording} = this.state;
    if (isRecording) return;
    const {frontCamera} = this.props;
    // const options = {quality: 0.5, base64: true};
    // const data = await this.camera?.takePictureAsync(options);
    // this.setState({placeholderImg: data?.uri});

    Animated.timing(
      this.placeholderAnimation.mirror,
      native(frontCamera ? 1 : 0, 1),
    ).start();
    Animated.timing(this.placeholderAnimation.opacity, native(1, 100)).start(
      () => {
        this.setState({displayPlaceholder: true});
      },
    );
  }
  async showCamera() {
    await this.setState({displayPlaceholder: false});
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
  placeholder() {
    const {placeholderImg} = this.state;
    const mirror = this.placeholderAnimation.mirror.interpolate({
      inputRange: [0, 1],
      outputRange: ['360deg', '180deg'],
    });
    return (
      <Animated.View
        style={{
          ...styles.placeholderImg,
          transform: [{rotateY: mirror}],
          opacity: this.placeholderAnimation.opacity,
        }}>
        <BlurView
          style={styles.placeholderImg}
          blurType="dark"
          blurAmount={1}
        />
        {/* {placeholderImg && (
          <Image source={{uri: placeholderImg}} style={styleApp.fullSize} />
        )} */}
      </Animated.View>
    );
  }
  render() {
    const {frontCamera, onCameraReady} = this.props;
    const {isRecording, displayPlaceholder} = this.state;
    return (
      <View style={styleApp.flexColumnBlack}>
        {(isRecording || !displayPlaceholder) && (
          <RNCamera
            onCameraReady={() => {
              this.setState({cameraReady: true});
              if (onCameraReady) {
                onCameraReady(true);
              }
              setTimeout(() => {
                Animated.timing(
                  this.placeholderAnimation.opacity,
                  native(0, 200),
                ).start();
              }, 300);
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
            playSoundOnCapture={false}
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
        )}
        {!isRecording && this.placeholder()}
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
  placeholderImg: {
    ...styleApp.fullSize,
    position: 'absolute',
    zIndex: 2,
  },
});

const mapStateToProps = (state) => {
  return {
    cameraAvailability: state.layout.cameraAvailability,
  };
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Camera);
