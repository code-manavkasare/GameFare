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

import {NodeCameraView} from 'react-native-nodemediaclient';
import {RNCamera} from 'react-native-camera';
import {Grid, Row, Col} from 'react-native-easy-grid';
import Permissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';

import Loader from '../../layout/loaders/Loader';

const {height, width} = Dimensions.get('screen');

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
      destroyStream(this.state.assetID);
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
          await that.setState({netline: netlineResults, waitingNetline: false});
        }
      });
  }
  mainButtonClick() {
    if (!this.state.waitingNetline) {
      if (!this.state.netline) {
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
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      await uploadNetlinePhoto(this.state.assetID, data.uri);
      await this.setState({waitingNetline: true});
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

  render() {
    const {navigation} = this.props;
    // note to self, don't show "align camera" msg and "take photo" button until stream created on firebase
    return (
      <View style={styles.container}>
        <LiveStreamHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={this.state.loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          click={() => navigation.navigate('TabsApp')}
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
              preset: 12,
              bitrate: 400000,
              profile: 1,
              fps: 15,
              videoFrontMirror: false,
            }}
            autopreview={true}
          />
        )}
        <Row style={styleApp.center2}>
          <Text style={styleApp.textBold}>
            Please position the camera correctly and take a photo
          </Text>
        </Row>
        {this.state.waitingNetline ? (
          <Loader style={styles.nodeCameraView} color="white" size={60} />
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
