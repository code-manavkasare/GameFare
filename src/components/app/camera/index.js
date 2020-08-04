import React, {Component} from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import Orientation from 'react-native-orientation-locker';
import StatusBar from '@react-native-community/status-bar';

import {layoutAction} from '../../../actions/layoutActions';

import BottomButtons from './components/BottomButtons';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import Camera from './components/Camera';

class CameraPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frontCamera: true,
      cameraReady: false,
    };
    this.animatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {navigation, layoutAction, route} = this.props;
    console.log('camera index', route);
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
      layoutAction('setLayout', {isFooterVisible: false});
      StatusBar.setBarStyle('light-content', true);
    });
  }
  componentWillUnmount() {
    this.focusListener();
  }
  flipCamera() {
    this.setState({frontCamera: !this.state.frontCamera});
  }
  close() {
    const {props, camera} = this;
    const {layoutAction, navigation} = props;
    if (camera) {
      camera.stopRecording(false);
    }
    layoutAction('setLayout', {isFooterVisible: true});
    navigation.goBack();
  }
  render() {
    const {state, camera} = this;
    const {frontCamera, cameraReady} = state;
    return (
      <View style={styleApp.flexColumnBlack}>
        <Camera
          onRef={(ref) => {
            this.camera = ref;
          }}
          onCameraReady={(cameraReady) => this.setState({cameraReady})}
          frontCamera={frontCamera}
        />
        {cameraReady && <HeaderBackButton
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
          clickButton2={() => this.flipCamera()}
          sizeIcon2={20}
          typeIcon2="moon"
          colorIcon2={colors.white}
        />}
        {cameraReady && <Row style={styles.bottomButtonsContainer}>
          <BottomButtons
            addFlag={() => camera.addFlag()}
            startRecording={() => camera.startRecording()}
            stopRecording={() => camera.stopRecording(true, true)}
          />
        </Row>}
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
    height: sizes.heightFooter + sizes.marginBottomApp,
    marginTop: 5,
    paddingTop: 0,
    width: '100%',
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(CameraPage);
