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

const {height, width} = Dimensions.get('screen');
import {NodeCameraView} from 'react-native-nodemediaclient';
import {RNCamera} from 'react-native-camera';
import {Grid, Row, Col} from 'react-native-easy-grid';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';

import LiveStreamHeader from './LiveStreamHeader';

const MUX_TOKEN_ID = 'cbc3b201-74d4-42ce-9296-a516a1c0d11d';
const MUX_TOKEN_SECRET =
  'pH0xdGK3b7qCA/kH8PSNspLqyLa+BJnsjnY4OBtHzECpDg6efuho2RdFsRgKkDqutbCkzAHS9Q1';

class LiveStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      outputUrl: 'rtmp://live.mux.com/app/',
      loading: true,
      streaming: false,
      streamKey: '',
      playbackId: '',
      netline: null,
      assetId: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  async componentDidMount() {
    await this.createStream();
  }

  async componentWillUnmount() {
    if (!this.state.assetId) {return;}
    var url = 'https://api.mux.com/video/v1/assets/' + this.state.assetId;
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
      playbackId: response.data.data.playback_ids.id,
      assetId: response.data.data.id,
    });
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
    // uploadPictureFirebase('streams/' + this.state.assetId + '/netlinePhoto/', uri)
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
