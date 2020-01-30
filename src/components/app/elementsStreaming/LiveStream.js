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
const {height, width} = Dimensions.get('screen');
import {NodeCameraView} from 'react-native-nodemediaclient';
import {Grid, Row, Col} from 'react-native-easy-grid';


import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
class LiveStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  render() {
    console.log('RENDER OF LIVESTREAM');
    return (
      <View>
        {/* <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Select an event to stream'}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.white}
          initialBackgroundColor={'white'}
          initialTitleOpacity={0}
        /> */}

        <NodeCameraView 
          style={styles.nodeCameraView}
          ref={(vb) => { this.vb = vb }}
          outputUrl = {""}
          camera={{ cameraId: 1, cameraFrontMirror: true }}
          audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
          video={{ preset: 12, bitrate: 400000, profile: 1, fps: 15, videoFrontMirror: false }}
          autopreview={true}
        />
        <Button
          onPress={() => console.log('press')}
          title={'Title prop'}
          color="#841584"
        />




      </View>
    );
  }
}

const styles = StyleSheet.create({
  nodeCameraView: {
    height: '90%',
  },
});
const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {})(LiveStream);
