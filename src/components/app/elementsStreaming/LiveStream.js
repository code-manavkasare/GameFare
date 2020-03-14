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

import {NodeCameraView} from 'react-native-nodemediaclient';
import KeepAwake from 'react-native-keep-awake';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CameraFooter from './CameraFooter';

import {destroyStream} from '../../functions/streaming';

const {width, height} = Dimensions.get('screen');
const heightAdjust = height - (16 / 9) * width;

class LiveStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      outputUrl: 'rtmp://live.mux.com/app/',
      error: false,
      streaming: false,
      streamed: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  mainButtonClick() {
    if (this.state.streaming) {
      this.stopStream();
    } else {
      this.startStream();
    }
  }
  async startStream() {
    await this.setState({streaming: true, streamed: true});
    this.nodeCameraView.start();
  }
  stopStream() {
    this.nodeCameraView.stop();
    this.setState({streaming: false});
    const stream = this.props.navigation.getParam('stream');
    const {navigation} = this.props;
    return navigation.navigate('Alert', {
      close: false,
      title:
        'Your game is being analyzed! Once complete, you will be notified!',
      textButton: 'Got it!',
      onGoBack: () => {
        navigation.navigate('Event', {
          objectID: stream.eventID,
          altDismiss: () => {
            navigation.navigate('TabsApp');
          },
        });
      },
    });
  }
  close() {
    const {streamed, streaming} = this.state;
    if (!streamed) {
      const stream = this.props.navigation.getParam('stream');
      destroyStream(stream.id);
      return this.props.navigation.navigate('TabsApp');
    } else if (streaming) {
      return this.stopStream();
    } else {
      return this.props.navigation.navigate('TabsApp');
    }
  }
  async switchCamera() {
    await this.nodeCameraView.switchCamera();
  }
  render() {
    const {navigation} = this.props;
    const stream = navigation.getParam('stream', null);
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
        <NodeCameraView
          style={styles.fullscreen}
          ref={(nodeCameraView) => {
            this.nodeCameraView = nodeCameraView;
          }}
          outputUrl={stream ? this.state.outputUrl + stream.streamKey : ''}
          camera={{cameraId: 1, cameraFrontMirror: true}}
          audio={{bitrate: 32000, profile: 1, samplerate: 44100}}
          video={{
            preset: 12,
            bitrate: 400000,
            profile: 1,
            fps: 15,
            videoFrontMirror: true,
          }}
          autopreview={true}
        />
        <CameraFooter
          takePhoto={() => this.mainButtonClick()}
          switchCamera={() => this.switchCamera()}
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
  fullscreen: {
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

export default connect(mapStateToProps, {})(LiveStream);
