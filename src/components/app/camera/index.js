import React, {Component} from 'react';
import {StyleSheet, View, Animated, StatusBar} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {heightFooter,marginBottomApp} from '../../style/sizes';

import BottomButtons from './components/BottomButtons';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import Camera from './components/Camera';

export default class CameraPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frontCamera: true,
      cameraReady: false,
      recording: false,
    };
    this.animatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(this);
    }
  }
  flipCamera() {
    this.setState({frontCamera: !this.state.frontCamera});
  }
  render() {
    const {state, camera} = this;
    const {frontCamera, cameraReady, recording} = state;
    return (
      <View style={styleApp.flexColumnBlack}>
        <Camera
          onRef={(ref) => {
            this.camera = ref;
          }}
          onCameraReady={(cameraReady) => this.setState({cameraReady})}
          onRecord={() => this.setState({recording: true})}
          onStopRecord={() => this.setState({recording: false})}
          frontCamera={frontCamera}
        />
        <HeaderBackButton
          AnimatedHeaderValue={this.animatedHeaderValue}
          inputRange={[0, 100]}
          colorLoader={'white'}
          sizeLoader={40}
          initialBorderColorIcon={'transparent'}
          initialTitleOpacity={0}
          typeIcon1="font"
          backgroundColorIcon1={colors.title + '70'}
          onPressColorIcon1={colors.title + '30'}
          nobackgroundColorIcon1={true}
          sizeIcon1={18}
          colorIcon1={colors.white}
          icon2={!recording ? 'sync-alt' : null}
          backgroundColorIcon2={'transparent'}
          clickButton2={() => this.flipCamera()}
          sizeIcon2={23}
          typeIcon2="font"
          colorIcon2={colors.white}
        />
        {cameraReady ? (
          <Row style={styles.bottomButtonsContainer}>
            <BottomButtons
              onRef={(ref) => {
                this.bottomButtonsRef = ref;
              }}
              addFlag={() => camera.addFlag()}
              startRecording={(cb) => camera.startRecording(cb)}
              stopRecording={() => camera.stopRecording(true, true)}
            />
          </Row>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    height: heightFooter + marginBottomApp,
    marginTop: 5,
    paddingTop: 0,
    width: '100%',
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
});
