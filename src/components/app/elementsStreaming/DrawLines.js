import React from 'react';
import {View, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import Svg, {Line} from 'react-native-svg';
import KeepAwake from 'react-native-keep-awake';
import {CameraKitCamera} from 'gamefare-camera-kit';
import Orientation from 'react-native-orientation-locker';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CameraFooter from './CameraFooter';

const {width, height} = Dimensions.get('screen');
const heightAdjust = height - (16 / 9) * width;

class DrawLines extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orientation: 'LANDSCAPE-LEFT',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this._orientationListener = this._orientationListener.bind(this);
  }
  componentDidMount() {
    Orientation.getDeviceOrientation(this._orientationListener);
    Orientation.addDeviceOrientationListener(this._orientationListener);
  }
  componentWillUnmount() {
    Orientation.removeDeviceOrientationListener(this._orientationListener);
  }
  _orientationListener(orientation) {
    if (
      (orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT') &&
      orientation !== this.state.orientation
    ) {
      this.setState({orientation: orientation});
    }
  }
  lockNetline() {
    const {navigation} = this.props;
    const stream = navigation.getParam('stream');
    navigation.navigate('LiveStream', {stream: stream});
  }
  async switchCamera() {
    await this.camera.changeCamera();
  }
  landscapeLine(x1, y1, x2, y2, stroke, strokeWidth) {
    // points should be scaled to [0, 1]
    // switch (1 - x) if using back camera
    if (this.state.orientation === 'LANDSCAPE-LEFT') {
      return (
        <Line
          x1={(1 - y1) * width}
          y1={(1 - x1) * height}
          x2={(1 - y2) * width}
          y2={(1 - x2) * height}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    } else {
      return (
        <Line
          x1={y1 * width}
          y1={x1 * height}
          x2={y2 * width}
          y2={x2 * height}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
  }
  render() {
    const {navigation} = this.props;
    const netline = navigation.getParam('netline');
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
          icon2="check"
          typeIcon2="font"
          clickButton1={() => navigation.pop()}
          clickButton2={() => this.lockNetline()}
        />
        <CameraKitCamera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.fullScreen}
          cameraOptions={{
            flashMode: 'off',
            focusMode: 'off',
            zoomMode: 'off',
          }}
        />
        <Svg
          style={styles.fullScreen}
          height={height - heightAdjust}
          width={width}>
          {this.landscapeLine(
            netline.midline.origin.x,
            netline.midline.origin.y,
            netline.midline.destination.x,
            netline.midline.destination.y,
            'red',
            '4',
          )}
          {this.landscapeLine(
            netline.corners.p1[0],
            netline.corners.p1[1],
            netline.corners.p2[0],
            netline.corners.p2[1],
            'green',
            '4',
          )}
          {this.landscapeLine(
            netline.corners.p2[0],
            netline.corners.p2[1],
            netline.corners.p3[0],
            netline.corners.p3[1],
            'green',
            '4',
          )}
          {this.landscapeLine(
            netline.corners.p3[0],
            netline.corners.p3[1],
            netline.corners.p4[0],
            netline.corners.p4[1],
            'green',
            '4',
          )}
          {this.landscapeLine(
            netline.corners.p4[0],
            netline.corners.p4[1],
            netline.corners.p1[0],
            netline.corners.p1[1],
            'green',
            '4',
          )}
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullScreen: {
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

export default connect(mapStateToProps, {})(DrawLines);
