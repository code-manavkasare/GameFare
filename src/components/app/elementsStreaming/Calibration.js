import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';
import Svg, {Line} from 'react-native-svg';

import {CameraKitCamera} from 'gamefare-camera-kit';
import {Grid, Row, Col} from 'react-native-easy-grid';
import Permissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';
import KeepAwake from 'react-native-keep-awake';
import Orientation from 'react-native-orientation-locker';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import Loader from '../../layout/loaders/Loader';

import {
  createStream,
  destroyStream,
  uploadNetlinePhoto,
} from '../../functions/streaming';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';

import CameraFooter from './CameraFooter';

const {width, height} = Dimensions.get('screen');
const heightAdjust = height - (16 / 9) * width;

class Calibration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waitingPermissions: false,
      waitingNetline: false,
      stream: null, // streamKey, playbackID, id
      orientation: 'PORTRAIT',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this._orientationListener = this._orientationListener.bind(this);
  }
  async componentDidMount() {
    const permission = await this.permissions();
    if (!permission) {
      // add an alert to the user here before deploying to users
      console.log('ERROR: Calibration: Camera or microphone unavailable');
      return this.props.navigation.navigate('TabsApp');
    }
    if (!this.state.waitingPermissions) {
      const success = this.createStream();
      if (!success) {
        console.log('ERROR: Calibration: Could not create stream');
        return this.props.navigation.navigate('TabsApp');
      }
      Orientation.getDeviceOrientation(this._orientationListener);
      Orientation.addDeviceOrientationListener(this._orientationListener);
      return this.props.navigation.navigate('Alert', {
        close: true,
        title:
          'Put a section of court surface in the red box and take a photo.',
        textButton: 'Got it.',
      });
    }
    return true;
  }
  _orientationListener(orientation) {
    if (
      (orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT') &&
      orientation !== this.state.orientation
    ) {
      this.setState({orientation: orientation});
    }
  }
  async componentWillUnmount() {
    if (this.state.stream) {
      firebase
        .database()
        .ref('streams/' + this.state.stream.id + '/netlineResults/')
        .off();
    }
    Orientation.removeDeviceOrientationListener(this._orientationListener);
  }
  async permissions() {
    let camPermission = await Permissions.check(PERMISSIONS.IOS.CAMERA);
    let micPermission = await Permissions.check(PERMISSIONS.IOS.MICROPHONE);
    if (
      camPermission === RESULTS.GRANTED &&
      micPermission === RESULTS.GRANTED
    ) {
      return true;
    } else if (
      camPermission === RESULTS.UNAVAILABLE ||
      micPermission === RESULTS.UNAVAILABLE
    ) {
      return false;
    } else if (
      camPermission === RESULTS.BLOCKED ||
      micPermission === RESULTS.BLOCKED
    ) {
      await this.setState({waitingPermissions: true});
      this.props.navigation.navigate('AlertYesNo', {
        textYesButton: 'Open Settings',
        textNoButton: 'Quit Stream',
        title: 'gamefare needs camera/microphone access to livestream events',
        yesClick: () => Permissions.openSettings(),
        noClick: () => {
          this.props.navigation.navigate('TabsApp');
        },
      });
      return true;
    }

    if (camPermission === RESULTS.DENIED) {
      camPermission = await Permissions.request(PERMISSIONS.IOS.CAMERA);
    }
    if (micPermission === RESULTS.DENIED) {
      micPermission = await Permissions.request(PERMISSIONS.IOS.MICROPHONE);
    }
    return (
      camPermission === RESULTS.GRANTED && micPermission === RESULTS.GRANTED
    );
  }
  async createStream() {
    const eventID = this.props.navigation.getParam('eventID', null);
    if (eventID) {
      const stream = await createStream(eventID);
      if (stream) {
        await this.setState({
          loading: false,
          outputUrl: this.state.outputUrl + stream.streamKey,
          stream: stream, //streamKey, playbackID, id
        });
        this.addNetlineListener();
        return true;
      }
    }
    return false;
  }
  addNetlineListener() {
    const that = this;
    firebase
      .database()
      .ref('streams/' + this.state.stream.id + '/netlineResults/')
      .on('value', async function(snap) {
        let netlineResults = snap.val();
        if (netlineResults) {
          await that.setState({waitingNetline: false});
          if (netlineResults.error) {
            let error =
              'Could not detect court. Try again. (' +
              netlineResults.error +
              ')';
            that.props.navigation.navigate('Alert', {
              close: true,
              title: error,
              textButton: 'Got it.',
            });
          } else {
            that.props.navigation.navigate('DrawLines', {
              stream: that.state.stream,
              netline: {
                corners: netlineResults.corners,
                midline: netlineResults.midline,
              },
            });
          }
        }
      });
  }
  async mainButtonClick() {
    if (!this.state.waitingNetline) {
      await this.setState({waitingNetline: true, netline: null});
      this.takeCalibrationPhoto();
    }
  }
  async takeCalibrationPhoto() {
    const image = await this.camera.capture(false);
    await uploadNetlinePhoto(
      this.state.stream.id,
      image,
      this.state.orientation,
    );
  }
  close() {
    // failed calibration or gave up, delete stream from firebase
    if (this.state.stream) {
      destroyStream(this.state.stream.id);
    }
    this.props.navigation.navigate('TabsApp');
  }
  async switchCamera() {
    await this.camera.changeCamera();
  }
  render() {
    // target coordinates
    const delta = 50;
    const x_offset =
      this.state.orientation === 'PORTRAIT'
        ? 0
        : this.state.orientation === 'LANDSCAPE-LEFT'
        ? -0.1 * width
        : 0.1 * width;
    const cx = width / 2 + x_offset;
    const cy = (height - heightAdjust) / 2;
    return (
      <View style={styles.container}>
        <KeepAwake />
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.grey}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={0}
          icon1="times"
          clickButton1={() => this.close()}
        />
        <CameraKitCamera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={[styles.fullScreen, {backgroundColor: 'black'}]}
          cameraOptions={{
            flashMode: 'off',
            focusMode: 'off',
            zoomMode: 'off',
          }}
        />
        {this.state.waitingNetline ? (
          <View style={[styles.fullScreen, styleApp.center]}>
            <Loader color="white" size={60} />
          </View>
        ) : (
          <Svg
            style={styles.fullScreen}
            height={height - heightAdjust}
            width={width}>
            <Line
              x1={cx - delta}
              y1={cy - delta}
              x2={cx + delta}
              y2={cy - delta}
              stroke="red"
              strokeWidth="4"
            />
            <Line
              x1={cx + delta}
              y1={cy - delta}
              x2={cx + delta}
              y2={cy + delta}
              stroke="red"
              strokeWidth="4"
            />
            <Line
              x1={cx + delta}
              y1={cy + delta}
              x2={cx - delta}
              y2={cy + delta}
              stroke="red"
              strokeWidth="4"
            />
            <Line
              x1={cx - delta}
              y1={cy + delta}
              x2={cx - delta}
              y2={cy - delta}
              stroke="red"
              strokeWidth="4"
            />
          </Svg>
        )}
        <CameraFooter
          takePhoto={() => this.mainButtonClick()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullScreen: {
    position: 'absolute',
    top: heightAdjust / 2,
    bottom: heightAdjust / 2,
    left: 0,
    right: 0,
  },
});
const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {})(Calibration);
