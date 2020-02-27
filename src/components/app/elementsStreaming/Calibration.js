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

import {RNCamera} from 'react-native-camera';
import {Grid, Row, Col} from 'react-native-easy-grid';
import Permissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';

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
  SHOW_LINES: 'show_lines',
  CORRECT: 'correct',
};

class Calibration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waitingPermissions: false,
      step: steps.PROMPT,
      stream: null, // streamKey, playbackID, id
      mirrorFront: false,
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
    }
    return true;
  }
  async componentWillUnmount() {
    if (this.state.stream) {
      firebase
        .database()
        .ref('streams/' + this.state.stream.id + '/netlineResults/')
        .off();
      // don't delete for now, LiveBall
      //destroyStream(this.state.stream.id, this.state.error);
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
          if (netlineResults.error) {
            await that.setState({
              step: steps.ERROR,
              netline: netlineResults,
            });
          } else {
            await that.setState({
              step: steps.SHOW_LINES,
              netline: {
                optimalNetline: netlineResults.optimalNetLine,
                doublesLine: netlineResults.doublesLine,
                baseLine: netlineResults.baseLine,
              },
            });
          }
        }
      });
  }
  async mainButtonClick() {
    if (this.state.step === steps.PROMPT || this.state.step === steps.ERROR) {
      await this.setState({step: steps.WAITING, netline: null});
      this.takeCalibrationPhoto();
    }
  }
  async takeCalibrationPhoto() {
    const options = {width: 720, quality: 0.5, base64: true};
    const data = await this.camera.takePictureAsync(options);
    await uploadNetlinePhoto(this.state.stream.id, data.uri); // needs to delete the old netline photo?
  }

  lockNetline() {
    this.props.navigation.navigate('LiveStream', {stream: this.state.stream});
  }

  render() {
    const {height, width} = Dimensions.get('screen');
    const {navigation} = this.props;
    return (
      <View style={styles.container}>
        <CalibrationHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={this.state.loader}
          click1={() => navigation.navigate('TabsApp')}
          click2={() => null}
          vis2={false}
          click3={() => this.lockNetline()}
          vis3={this.state.step === steps.SHOW_LINES || this.state.step === steps.PROMPT}
          clickErr={() => this.setState({error: !this.state.error})}
        />
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={[styles.nodeCameraView, {transform: [{rotateY: '180deg'}]}]}
          type={RNCamera.Constants.Type.front}
          flashMode={RNCamera.Constants.FlashMode.off}
        />
        {this.state.step === steps.PROMPT ? (
          <Row style={styleApp.center2}>
            <Text style={styleApp.textBold}>
              Please position the camera correctly and take a photo
            </Text>
          </Row>
        ) : this.state.step === steps.WAITING ? (
          <View style={[styles.nodeCameraView, styles.smallRow]}>
            <Loader color="white" size={60} />
          </View>
        ) : this.state.step === steps.ERROR ? (
          <Row style={styleApp.center2}>
            <Text style={styleApp.textBold}>
              Could not find net or base lines. Exit stream and try again.
            </Text>
          </Row>
        ) : this.state.step === steps.SHOW_LINES ? (
          <Svg style={styles.nodeCameraView} height="100%" width="100%">
            <Line
              x1={this.state.netline.optimalNetline.origin.x * width}
              y1={this.state.netline.optimalNetline.origin.y * height}
              x2={this.state.netline.optimalNetline.destination.x * width}
              y2={this.state.netline.optimalNetline.destination.y * height}
              stroke="red"
              strokeWidth="4"
            />
            <Line
              x1={this.state.netline.doublesLine.origin.x * width}
              y1={this.state.netline.doublesLine.origin.y * height}
              x2={this.state.netline.doublesLine.destination.x * width}
              y2={this.state.netline.doublesLine.destination.y * height}
              stroke="green"
              strokeWidth="4"
            />
            <Line
              x1={this.state.netline.baseLine.origin.x * width}
              y1={this.state.netline.baseLine.origin.y * height}
              x2={this.state.netline.baseLine.destination.x * width}
              y2={this.state.netline.baseLine.destination.y * height}
              stroke="blue"
              strokeWidth="4"
            />
          </Svg>
        ) : null}

        <Col style={styles.toolbar}>
          <ButtonColor
            view={() => {
              return <View />;
            }}
            click={() => this.mainButtonClick()}
            color={'red'}
            style={styles.recordButton}
            onPressColor={colors.off}
          />
        </Col>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  netlineContainer: {
    flex: 1,
  },
  smallRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeCameraView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  toolbar: {
    flex: 1,
    height: '100%',
    paddingLeft: 10,
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
  },
  recordButton: {
    ...styleApp.center2,
    width: 48,
    height: 48,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'black',
  },
});
const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {})(Calibration);
