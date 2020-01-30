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
    this.state = {
      outputUrl: '',
      loading: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  render() {
    console.log('RENDER OF LIVESTREAM');
    const {navigation} = this.props;
    return (
      <View style={styles.container}>
        <NodeCameraView 
          style={styles.nodeCameraView}
          ref={(vb) => { this.vb = vb }}
          outputUrl = {this.state.outputUrl}
          camera={{ cameraId: 1, cameraFrontMirror: true }}
          audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
          video={{ preset: 12, bitrate: 400000, profile: 1, fps: 15, videoFrontMirror: false }}
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
            onPress={() => console.log('press')}
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
