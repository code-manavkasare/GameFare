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

import {NodeCameraView} from 'react-native-nodemediaclient';
import {RNCamera} from 'react-native-camera';
import {Grid, Row, Col} from 'react-native-easy-grid';
import Permissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';

const {height, width} = Dimensions.get('screen');

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';

import LiveStreamHeader from './LiveStreamHeader';
import { has } from 'ramda';

const MUX_TOKEN_ID = 'cbc3b201-74d4-42ce-9296-a516a1c0d11d';
const MUX_TOKEN_SECRET =
  'pH0xdGK3b7qCA/kH8PSNspLqyLa+BJnsjnY4OBtHzECpDg6efuho2RdFsRgKkDqutbCkzAHS9Q1';

class LiveStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      outputUrl: 'rtmp://live.mux.com/app/',
      waitingPermissions: true,
      loading: true,
      streaming: false,
      assetID: '',
      streamKey: '',
      playbackID: '',
      netline: null,
    };
    this._willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      async () => {
        if (this.state.waitingPermissions) {
          const hasPermission = await this.checkPermissions();
          if (hasPermission) {
            this.createStream();
          } else {
            this.getPermission();
          }
        }
      },
    );
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  async checkPermission(request) {
    const permission = await Permissions.check(request);
    return (permission === RESULTS.GRANTED);
  }

  async askPermission(request) {
    const permission = await Permissions.request(request);
    return (permission === RESULTS.GRANTED);
  }

  async getPermissions(request) {
    let permission = await Permissions.request(request);
    switch (permission) {
      case RESULTS.GRANTED:
        return true;
      case RESULTS.DENIED:
      case RESULTS.BLOCKED:

        return false;
      case RESULTS.UNAVAILABLE:
        return false;
    }
  }
  async permissions() {
    let camPermission = await Permissions.check(PERMISSIONS.IOS.CAMERA);
    let micPermission = await Permissions.check(PERMISSIONS.IOS.MICROPHONE);
    if (camPermission === RESULTS.GRANTED && micPermission === RESULTS.GRANTED) {
      return true;
    } else if (camPermission === RESULTS.UNAVAILABLE || micPermission === RESULTS.UNAVAILABLE) {
      return false;
    } else if (camPermission === RESULTS.BLOCKED || micPermission === RESULTS.BLOCKED) {
      this.props.navigation.navigate('AlertYesNo', {
        textYesButton: 'Open Settings',
        textNoButton: 'Quit Stream',
        title:
          'gamefare needs camera/microphone access to livestream events',
        yesClick: () => Permissions.openSettings(),
        noClick: () => {this.props.navigation.navigate('TabsApp');},
      });
      return true;
    }

    if (camPermission === RESULTS.DENIED) {
      camPermission = await Permissions.request(PERMISSIONS.IOS.CAMERA);
    }
    if (micPermission === RESULTS.DENIED) {
      micPermission = await Permissions.request(PERMISSIONS.IOS.MICROPHONE);
    }
    return (camPermission === RESULTS.GRANTED && micPermission === RESULTS.GRANTED);
  }

  async componentDidMount() {
    const permission = await this.permissions();
    if (!permission) { // camera or microphone unavailable, leave live stream
      this.props.navigation.navigate('TabsApp');
    }
    if (!this.state.waitingPermissions) { // creates stream on firebase, locally, and shows camera
      this.createStream();
    }
    console.log('LiveStream componentDidMount');
  }

  async componentWillUnmount() {
    this._willFocusSubscription.remove();
    if (!this.state.assetID) {return;}
    var url = 'https://api.mux.com/video/v1/assets/' + this.state.assetID;
    const response = await axios.delete(
      url,
      {},
      { auth: {
          username: MUX_TOKEN_ID,
          password: MUX_TOKEN_SECRET,
        },
      },
    );
    console.log(response);
  }

  async createStream() {
    var url = 'https://api.mux.com/video/v1/live-streams';
    const response = await axios.post(
      url,
      {
        playback_policy: ['public'],
        new_asset_settings: {
          playback_policy: ['public'],
        },
      },
      {
        auth: {
          username: MUX_TOKEN_ID,
          password: MUX_TOKEN_SECRET,
        },
      },
    );
    console.log(JSON.stringify(response.data, null, 2));
    this.setState({
      outputUrl: this.state.outputUrl + response.data.data.stream_key,
      loading: false,
      streamKey: response.data.data.stream_key,
      playbackID: response.data.data.playback_ids.id,
      assetID: response.data.data.id,
    });
    return true;
  }

  mainButtonClick() {
    this.setState({netline: {id: 1}});
    // return;
    // if (this.state.streaming) {
    //   this.stopStream();
    // } else {
    //   this.startStream();
    // }
  }

  async takeCalibrationPhoto() {
    if (this.camera) {
      const data = await this.camera.capture();
      const uri = data.path;
      console.log(uri);
      await this.uploadNetlinePhoto(uri);
    }
  }

  async uploadNetlinePhoto(uri) {
    // uploadPictureFirebase('streams/' + this.state.assetID + '/netlinePhoto/', uri)
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
    console.log('RENDER OF LIVESTREAM');
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
          initialTitleOpacity={0}
          icon1={'times'}
          icon2={null}
          clickButton1={() => navigation.navigate('TabsApp')}
        />
        {!this.state.netline
        // this camera takes a calibration photo
        ? <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.nodeCameraView}
            type={RNCamera.Constants.Type.front}
            flashMode={RNCamera.Constants.FlashMode.on}
          />
        // this camera streams live video
        : <NodeCameraView
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
        }
        <View style={styles.smallCol}>
          <Row style={styleApp.center2}>
            <Text>
              Please position the camera correctly
            </Text>
          </Row>
          <Row style={styleApp.center2}>
            <ButtonColor
              view={() => {
                return (
                  <View>
                    <Text>
                      Done
                    </Text>
                  </View>
                );
              }}
              click={() => this.takeCalibrationPhoto()}
              color={'white'}
              style={styles.calibrationButton}
              onPressColor={colors.off}
            />
          </Row>
        </View>
        <View style={styles.toolbar}>
          <Col style={[styleApp.center2, {paddingBottom: 5}]}>
            <ButtonColor
              view={() => {
                return (
                  <View

                  />
                );
              }}
              click={() => this.mainButtonClick()}
              color={'red'}
              style={styles.recordButton}
              onPressColor={colors.off}
            />
          </Col>
        </View>
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
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
  },
  calibrationButton: {
    ...styleApp.center2,
    width: 60,
    height: 40,
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
