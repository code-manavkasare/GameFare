import React from 'react';
import {View, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import Svg, {Line} from 'react-native-svg';
import KeepAwake from 'react-native-keep-awake';
import {RNCamera} from 'react-native-camera';

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
        <RNCamera
          style={styles.nodeCameraView}
          type={RNCamera.Constants.Type.front}
        />
        <Svg style={styles.nodeCameraView} height={height} width={width}>
          <Line
            x1={(1 - netline.optimalNetline.origin.y) * width}
            y1={netline.optimalNetline.origin.x * height}
            x2={(1 - netline.optimalNetline.destination.y) * width}
            y2={netline.optimalNetline.destination.x * height}
            stroke="red"
            strokeWidth="4"
          />
          <Line
            x1={(1 - netline.doublesLine.origin.y) * width}
            y1={netline.doublesLine.origin.x * height}
            x2={(1 - netline.doublesLine.destination.y) * width}
            y2={netline.doublesLine.destination.x * height}
            stroke="green"
            strokeWidth="4"
          />
          <Line
            x1={(1 - netline.baseLine.origin.y) * width}
            y1={netline.baseLine.origin.x * height}
            x2={(1 - netline.baseLine.destination.y) * width}
            y2={netline.baseLine.destination.x * height}
            stroke="blue"
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
  nodeCameraView: {
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
