import React, {Component} from 'react';
import {StyleSheet, View, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {RNCamera} from 'react-native-camera';
import PropTypes from 'prop-types';
import {BlurView} from '@react-native-community/blur';
import queue, {Worker} from 'react-native-job-queue';

import {native} from '../../../animations/animations';
import styleApp from '../../../style/style';

import {layoutAction} from '../../../../store/actions/layoutActions';

import {getVideoInfo, getNewVideoSavePath} from '../../../functions/pictures';
import {
  addLocalVideo,
  openVideoPlayer,
} from '../../../functions/videoManagement';
import {logMixpanel} from '../../../functions/logs';
import {boolShouldComponentUpdate} from '../../../functions/redux';

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
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
    });
  }
  configureQueue() {
    queue.removeWorker('hideCamera');
    queue.removeWorker('showCamera');
    queue.addWorker(new Worker('hideCamera', this.hideCamera.bind(this)));
    queue.addWorker(new Worker('showCamera', this.showCamera.bind(this)));
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
    Animated.timing(
      this.placeholderAnimation.mirror,
      native(frontCamera ? 1 : 0, 1),
    ).start();
    Animated.timing(this.placeholderAnimation.opacity, native(1, 50)).start(
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
      logMixpanel({
        label: 'Start recording',
      });
      layoutAction('setGeneralSessionRecording', true);
      this.setState({isRecording: true});
      const options = {
        quality: RNCamera.Constants.VideoQuality['2160p'],
        path: getNewVideoSavePath(),
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
      logMixpanel({
        label: 'Stop recording',
      });
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
    await addLocalVideo({video: videoInfo, backgroundUpload: true});
    logMixpanel({
      label: 'Save recording',
    });
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
    const {frontCamera, onCameraReady, currentScreenSize} = this.props;
    const {
      orientation,
      currentWidth: width,
      currentHeight: height,
    } = currentScreenSize;
    const {isRecording, displayPlaceholder} = this.state;
    return (
      <View style={styleApp.flexColumnBlack}>
        {(isRecording || !displayPlaceholder) && (
          <RNCamera
            videoStabilizationMode={'standard'}
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
            orientation={orientation}
            style={{...styles.preview, maxWidth: width, maxHeight: height}}
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
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Camera);
