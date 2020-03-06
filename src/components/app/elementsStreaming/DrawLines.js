import React from 'react';
import {View, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import Svg, {Line} from 'react-native-svg';
import KeepAwake from 'react-native-keep-awake';
import {CameraKitCamera} from 'react-native-camera-kit';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import CalibrationHeader from './CalibrationHeader';

class DrawLines extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    // change to front camera
    await this.camera.changeCamera();
  }
  lockNetline() {
    const {navigation} = this.props;
    const stream = navigation.getParam('stream');
    navigation.navigate('LiveStream', {stream: stream});
  }
  render() {
    const {navigation} = this.props;
    const netline = navigation.getParam('netline');
    const {height, width} = Dimensions.get('window');
    return (
      <View style={styles.container}>
        <KeepAwake />
        <CalibrationHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          close={() => navigation.pop()}
          next={() => this.lockNetline()}
          nextVis={true}
        />
        <CameraKitCamera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={{
            flex: 1,
            backgroundColor: 'white',
          }}
          cameraOptions={{
            flashMode: 'off',
            focusMode: 'off',
            zoomMode: 'off',
          }}
        />
        <Svg style={styles.fullScreen} height={height} width={width}>
          <Line
            x1={(1 - netline.midline.origin.y) * width}
            y1={netline.midline.origin.x * height}
            x2={(1 - netline.midline.destination.y) * width}
            y2={netline.midline.destination.x * height}
            stroke="red"
            strokeWidth="4"
          />
          <Line
            x1={(1 - netline.corners.p1[1]) * width}
            y1={netline.corners.p1[0] * height}
            x2={(1 - netline.corners.p2[1]) * width}
            y2={netline.corners.p2[0] * height}
            stroke="green"
            strokeWidth="4"
          />
          <Line
            x1={(1 - netline.corners.p2[1]) * width}
            y1={netline.corners.p2[0] * height}
            x2={(1 - netline.corners.p3[1]) * width}
            y2={netline.corners.p3[0] * height}
            stroke="green"
            strokeWidth="4"
          />
          <Line
            x1={(1 - netline.corners.p3[1]) * width}
            y1={netline.corners.p3[0] * height}
            x2={(1 - netline.corners.p4[1]) * width}
            y2={netline.corners.p4[0] * height}
            stroke="green"
            strokeWidth="4"
          />
          <Line
            x1={(1 - netline.corners.p4[1]) * width}
            y1={netline.corners.p4[0] * height}
            x2={(1 - netline.corners.p1[1]) * width}
            y2={netline.corners.p1[0] * height}
            stroke="green"
            strokeWidth="4"
          />
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraView: {
    flex: 1,
    backgroundColor: 'white',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
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
