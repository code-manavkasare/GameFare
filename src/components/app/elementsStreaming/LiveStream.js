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
import {Grid, Row, Col} from 'react-native-easy-grid';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';

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
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  async componentDidMount() {
    await this.createStream();
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
    });
  }

  mainButtonClick() {
    if(this.state.streaming) {
      this.vb.stop();
    } else {
      this.setState({streaming: true});
      this.vb.start();
    }
  }

  render() {
    console.log('RENDER OF LIVESTREAM');
    const {navigation} = this.props;
    return (
      <View style={styles.container}>
        <NodeCameraView
          style={styles.nodeCameraView}
          ref={(vb) => {
            this.vb = vb;
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
        <HeaderBackButton
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
        <View style={styles.toolbar}>
          <Button
            onPress={() => this.mainButtonClick()}
            title={'Title prop'}
            color="black"
          />
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
});
const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {})(LiveStream);
