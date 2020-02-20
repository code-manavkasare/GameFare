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
import {Grid, Row, Col} from 'react-native-easy-grid';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';

import LiveStreamHeader from './LiveStreamHeader';

class LiveStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      outputUrl: 'rtmp://live.mux.com/app/',
      error: false,
      stream: null,
      streaming: false,
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
    await this.setState({streaming: true});
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
  render() {
    const {navigation} = this.props;
    const stream = navigation.getParam('stream', null);
    return (
      <View style={styles.container}>
        <LiveStreamHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={this.state.loader}
          streaming={this.state.streaming}
          click={() => navigation.navigate('TabsApp')}
        />
        <NodeCameraView
          style={styles.nodeCameraView}
          ref={(nodeCameraView) => {
            this.nodeCameraView = nodeCameraView;
          }}
          outputUrl={stream ? this.state.outputUrl + stream.streamKey : ''}
          camera={{cameraId: 1, cameraFrontMirror: false}}
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
        <Col style={styles.toolbar}>
          <ButtonColor
            view={() => {
              return <View />;
            }}
            click={() => this.mainButtonClick()}
            color={this.state.streaming ? 'red' : 'white'}
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
