import React, {Component} from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {RNCamera} from 'react-native-camera';
import {Col, Row} from 'react-native-easy-grid';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import Orientation from 'react-native-orientation-locker';
import StatusBar from '@react-native-community/status-bar';

import {getVideoInfo} from '../../functions/pictures';
import {
  addVideo,
  makeVideoFlag,
  addVideoWithFlags,
  alertStopRecording,
} from '../../functions/videoManagement';
import {layoutAction} from '../../../actions/layoutActions';

import BottomButtons from './components/BottomButtons';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import Camera from './components/Camera';

class CameraPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
        frontCamera: false,
    };
    this.animatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {navigation, layoutAction} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
      layoutAction('setLayout', {isFooterVisible: false});
      StatusBar.setBarStyle('light-content', true);
    });
    this.blurListener = navigation.addListener('blur', () => {
      layoutAction('setLayout', {isFooterVisible: true});
      StatusBar.setBarStyle('dark-content', true);
    });
  }
  componentWillUnmount() {
    this.focusListener();
    this.blurListener();
  }
  async afterSave(videoInfo) {
    const {processRecording, noNavigation} = this.props.route.params;
    if (processRecording) {
      await processRecording(videoInfo);
    }
    if (!noNavigation) {
      this.close();
    }
  }
  close() {
    this.camera.stopRecording(false);
    const {layoutAction, navigation} = this.props;
    layoutAction('setLayout', {isFooterVisible: true});
    navigation.pop();
  }
  render() {
    const {state, camera} = this;
    const {frontCamera} = state;
    return (
      <View style={styles.container}>
        <Camera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          frontCamera={frontCamera}
          afterSave={(videoInfo) => this.afterSave(videoInfo)}
        />
        <HeaderBackButton
          AnimatedHeaderValue={this.animatedHeaderValue}
          inputRange={[5, 10]}
          colorLoader={'white'}
          sizeLoader={40}
          initialBorderColorIcon={'transparent'}
          initialTitleOpacity={0}
          icon1={'arrow-left'}
          typeIcon1="font"
          backgroundColorIcon1={colors.title + '70'}
          onPressColorIcon1={colors.title + '30'}
          clickButton1={() => this.close()}
          nobackgroundColorIcon1={true}
          sizeIcon1={18}
          colorIcon1={colors.white}
          icon2={'switchCam'}
          backgroundColorIcon2={colors.title + '70'}
          clickButton2={() => this.setState({frontCamera: !frontCamera})}
          sizeIcon2={20}
          typeIcon2="moon"
          colorIcon2={colors.white}
        />
        <Row style={styles.recordButtonContainer}>
          <BottomButtons
            addFlag={() => camera.addFlag()}
            startRecording={() => camera.startRecording()}
            stopRecording={() => camera.stopRecording(true, true)}
          />
        </Row>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  recordButtonContainer: {
    position: 'absolute',
    bottom: 0,
    height: sizes.heightFooter + sizes.marginBottomApp,
    paddingTop: 0,
    width: '100%',
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  viewRecordingTime: {
    width: '100%',
    height: 32,
    borderRadius: 5,
    paddingLeft: 5,
    paddingRight: 5,
    ...styleApp.center,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Camera);
