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
import axios from 'axios';
import firebase from 'react-native-firebase';
import Svg, {Line} from 'react-native-svg';

import {NodeCameraView} from 'react-native-nodemediaclient';
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

import LiveStreamHeader from './LiveStreamHeader';
import {has} from 'ramda';

const MUX_TOKEN_ID = 'cbc3b201-74d4-42ce-9296-a516a1c0d11d';
const MUX_TOKEN_SECRET =
  'pH0xdGK3b7qCA/kH8PSNspLqyLa+BJnsjnY4OBtHzECpDg6efuho2RdFsRgKkDqutbCkzAHS9Q1';

class LiveStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      outputUrl: 'rtmp://live.mux.com/app/',
      error: false,
      waitingPermissions: false,
      waitingNetline: false,
      loading: true,
      streaming: false,
      assetID: '',
      streamKey: '',
      playbackID: '',
      netline: null,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    const permission = await this.permissions();
    if (!permission) {
      // camera or microphone unavailable, leave live stream
      this.props.navigation.navigate('TabsApp');
    }
    if (!this.state.waitingPermissions) {
      // creates stream on firebase, locally, and shows camera
      this.createStream();
    }
  }
  async componentWillUnmount() {
    if (this.state.assetID) {
      firebase
        .database()
        .ref('streams/' + this.state.assetID + '/netlineResults/')
        .off();
      destroyStream(this.state.assetID, this.state.error);
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
    const eventID = this.props.navigation.getParam('eventID', 'noID');
    const stream = await createStream(eventID);
    this.setState({
      loading: false,
      outputUrl: this.state.outputUrl + stream.streamKey,
      streamKey: stream.streamKey,
      playbackID: stream.playbackID,
      assetID: stream.id,
    });
    this.addNetlineListener();
  }
  addNetlineListener() {
    const that = this;
    firebase
      .database()
      .ref('streams/' + this.state.assetID + '/netlineResults/')
      .on('value', async function(snap) {
        let netlineResults = snap.val();
        if (netlineResults) {
          console.log(netlineResults);
          if (netlineResults.error) {
            await that.setState({
              waitingNetline: false,
              netline: {
                error: true,
              },
            });
          } else {
            await that.setState({
              netline: {
                index: -1,
                optimalNetline: netlineResults[0].optimalNetLine,
                doublesLine: netlineResults[1].doublesLine,
                candidates: netlineResults.slice(2),
              },
              waitingNetline: false,
            });
            console.log("GOT NETLINE RESULTS");
            console.log(this.state.netline.optimalNetline);
            console.log(this.state.netline.doublesLine);
          }
        }
      });
  }
  mainButtonClick() {
    if (!this.state.waitingNetline) {
      if (!this.state.netline || this.state.netline.error) {
        this.takeCalibrationPhoto();
      } else {
        if (this.state.streaming) {
          this.stopStream();
        } else {
          this.startStream();
        }
      }
    }
  }
  async takeCalibrationPhoto() {
    if (this.camera) {
      const options = {width: 720, quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      await this.setState({waitingNetline: true, netline: null});
      await uploadNetlinePhoto(this.state.assetID, data.uri);
    }
  }

  startStream() {
    this.setState({streaming: true});
    this.nodeCameraView.start();
  }
  stopStream() {
    this.nodeCameraView.stop();
    this.setState({streaming: false});
  }

  async cycleNetlineCandidates() {
    if (!this.state.netline || this.state.netline.error) {
      return;
    }
    if (
      this.state.netline.index ===
      Object.keys(this.state.netline.candidates[0]).length - 1
    ) {
      await this.setState({netline: {...this.state.netline, index: -1}});
    } else {
      await this.setState({
        netline: {...this.state.netline, index: this.state.netline.index + 1},
      });
    }
  }

  render() {
    const {height, width} = Dimensions.get('screen');
    const {navigation} = this.props;
    console.log('state');
    return (
      <View style={styles.container}>
        <LiveStreamHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={this.state.loader}
          click={() => navigation.navigate('TabsApp')}
          clickMid={() => this.cycleNetlineCandidates()}
          clickErr={() => this.setState({error: !this.state.error})}
        />
        {!this.state.netline && !this.state.waitingNetline ? (
          // this camera takes a calibration photo
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            style={styles.nodeCameraView}
            type={RNCamera.Constants.Type.front}
            flashMode={RNCamera.Constants.FlashMode.off}
          />
        ) : (
          // this camera streams live video
          <NodeCameraView
            style={styles.nodeCameraView}
            ref={(nodeCameraView) => {
              this.nodeCameraView = nodeCameraView;
            }}
            outputUrl={this.state.loading ? null : this.state.outputUrl}
            camera={{cameraId: 1, cameraFrontMirror: true}}
            audio={{bitrate: 32000, profile: 1, samplerate: 44100}}
            video={{
              preset: 1,
              bitrate: 400000,
              profile: 1,
              fps: 15,
              videoFrontMirror: false,
            }}
            autopreview={true}
          />
        )}
        {!this.state.waitingNetline && !this.state.netline ? (
          <Row style={styleApp.center2}>
            <Text style={styleApp.textBold}>
              Please position the camera correctly and take a photo
            </Text>
          </Row>
        ) : null}
        {this.state.waitingNetline ? (
          <View style={[styles.nodeCameraView, styles.smallRow]}>
            <Loader color="white" size={60} />
          </View>
        ) : null}

        {this.state.netline && !this.state.waitingNetline ? (
          this.state.netline.error ? (
            <Row style={styleApp.center2}>
              <Text style={styleApp.textBold}>
                Could not find net or base lines. Exit stream and try again.
              </Text>
            </Row>
          ) : (
            <Svg style={styles.nodeCameraView} height="100%" width="100%">
              {this.state.netline.index === -1 ? (
                <Line
                  x1={(1 - this.state.netline.optimalNetline.origin.x) * width}
                  y1={this.state.netline.optimalNetline.origin.y * height}
                  x2={
                    (1 - this.state.netline.optimalNetline.destination.x) *
                    width
                  }
                  y2={this.state.netline.optimalNetline.destination.y * height}
                  stroke="red"
                  strokeWidth="4"
                />
              ) : (
                <Line
                  x1={
                    (1 -
                      this.state.netline.candidates[0][
                        'candidate_0' + this.state.netline.index
                      ].origin.x) *
                    width
                  }
                  y1={
                    this.state.netline.candidates[0][
                      'candidate_0' + this.state.netline.index
                    ].origin.y * height
                  }
                  x2={
                    (1 -
                      this.state.netline.candidates[0][
                        'candidate_0' + this.state.netline.index
                      ].destination.x) *
                    width
                  }
                  y2={
                    this.state.netline.candidates[0][
                      'candidate_0' + this.state.netline.index
                    ].destination.y * height
                  }
                  stroke="red"
                  strokeWidth="4"
                />
              )}
              <Line
                x1={(1 - this.state.netline.doublesLine.origin.x) * width}
                y1={this.state.netline.doublesLine.origin.y * height}
                x2={(1 - this.state.netline.doublesLine.destination.x) * width}
                y2={this.state.netline.doublesLine.destination.y * height}
                stroke="green"
                strokeWidth="4"
              />
            </Svg>
          )
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

export default connect(mapStateToProps, {})(LiveStream);
