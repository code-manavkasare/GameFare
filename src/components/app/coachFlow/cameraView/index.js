import React, {Component} from 'react';
import {RNCamera} from 'react-native-camera';
import PropTypes from 'prop-types';

export default class CameraView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  cameraView() {
    const {styleCamera, cameraFront, captureAudio} = this.props;
    return (
      <RNCamera
        ref={(ref) => {
          this.camera = ref;
        }}
        style={styleCamera}
        type={
          cameraFront
            ? RNCamera.Constants.Type.front
            : RNCamera.Constants.Type.back
        }
        flashMode={RNCamera.Constants.FlashMode.off}
        captureAudio={captureAudio}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        androidRecordAudioPermissionOptions={{
          title: 'Permission to use audio recording',
          message: 'We need your permission to use your audio',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        onGoogleVisionBarcodesDetected={({barcodes}) => {}}
      />
    );
  }

  render() {
    return this.cameraView();
  }
}

CameraView.propTypes = {
  styleCamera: PropTypes.object,
  cameraFront: PropTypes.bool,
  captureAudio: PropTypes.bool,
};
