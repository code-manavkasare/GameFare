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

import {CameraKitCamera} from 'react-native-camera-kit';
import {Grid, Row, Col} from 'react-native-easy-grid';
import Permissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';
import KeepAwake from 'react-native-keep-awake';

import Loader from '../../layout/loaders/Loader';

import {
  createStream,
  destroyStream,
  uploadNetlinePhoto,
} from '../../functions/streaming';

import {pickLibrary} from '../../functions/pictures';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';

import CalibrationHeader from './CalibrationHeader';

const steps = {
  PROMPT: 'prompt',
  ERROR: 'error',
  WAITING: 'waiting',
};

class Calibration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waitingPermissions: false,
      waitingNetline: false,
      stream: null, // streamKey, playbackID, id
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
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
      return this.props.navigation.navigate('Alert', {
        close: true,
        title:
          'Set up the camera and take a photo of the court for calibration.',
        textButton: 'Got it.',
      });
    }
    return true;
  }
  async componentWillUnmount() {
    if (this.state.stream) {
      firebase
        .database()
        .ref('streams/' + this.state.stream.id + '/netlineResults/')
        .off();
    }
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
    await uploadNetlinePhoto(this.state.stream.id, image);
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
    return (
      <View style={styles.container}>
        <KeepAwake />
        <CalibrationHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          title={'Calibration'}
          loader={this.state.loader}
          close={() => this.close()}
        />
        <CameraKitCamera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.cameraView}
          cameraOptions={{
            flashMode: 'off',
            focusMode: 'off',
            zoomMode: 'off',
          }}
        />
        {this.state.waitingNetline ? (
          <View style={[styles.fullScreen, styles.smallRow]}>
            <Loader color="white" size={60} />
          </View>
        ) : null}
        <Row style={styles.toolbar}>
          <Col size={33} />
          <Col style={styleApp.center} size={34}>
            <ButtonColor
              view={() => {
                return <View />;
              }}
              click={() => this.mainButtonClick()}
              color={this.state.waitingNetline ? 'black' : 'white'}
              style={styles.recordButton}
              onPressColor={colors.off}
            />
          </Col>
          <Col size={33} style={styleApp.center}>
            <ButtonColor
              view={() => {
                return (
                  <AllIcons
                    name={'random'}
                    color={colors.greyDark}
                    size={16}
                    type="font"
                  />
                );
              }}
              click={() => this.switchCamera()}
              color={'white'}
              style={styles.recordButton}
              onPressColor={colors.off}
            />
          </Col>
        </Row>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  smallRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraView: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    flex: 1,
    width: '100%',
    height: '10%',
    position: 'absolute',
    bottom: 0,
    paddingTop: 5,
  },
  recordButton: {
    ...styleApp.center2,
    width: 48,
    height: 48,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'white',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
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
