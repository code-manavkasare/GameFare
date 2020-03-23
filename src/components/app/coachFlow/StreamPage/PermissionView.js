import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';

import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
import {Col, Row} from 'react-native-easy-grid';
import {
  goToSettings,
  microphonePermission,
  cameraPermission,
} from '../../../functions/streaming';
const {height, width} = Dimensions.get('screen');

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import FadeInView from 'react-native-fade-in-view';

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
      loader: true,
    };
  }
  async componentDidMount() {
    const cameraAccess = await cameraPermission();
    const microAccess = await microphonePermission();
    this.setState({
      cameraAccess: cameraAccess,
      microAccess: microAccess,
      loader: false,
    });
  }
  button(text, active) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !active && goToSettings()}
        style={{...styleApp.center, width: width, height: 30}}>
        <Text
          style={[
            styleApp.text,
            {color: active ? colors.off : colors.primary},
          ]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
  permissionView() {
    const {loader, microAccess, cameraAccess} = this.state;
    return (
      <FadeInView
        duration={300}
        style={{
          ...styleApp.center,
          height: '100%',
          width: width,
          position: 'absolute',
          backgroundColor: colors.title,
          opacity: 0.8,
          zIndex: 7,
        }}>
        <Text style={[styleApp.title, {color: colors.white, marginBottom: 10}]}>
          Stream your performance
        </Text>
        <Text style={styleApp.subtitle}>Enable access so you can start</Text>
        <Text style={[styleApp.subtitle, {marginBottom: 30}]}>
          taking photos and videos.
        </Text>

        {!loader && (
          <View>
            {this.button(
              cameraAccess
                ? '✓   Camera access enabled'
                : 'Enable camera access',
              cameraAccess,
            )}
            {this.button(
              microAccess
                ? '✓   Microphone access enabled'
                : 'Enable microphone access',
              microAccess,
            )}
          </View>
        )}
      </FadeInView>
    );
  }
  render() {
    return this.permissionView();
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(mapStateToProps, {coachAction})(StreamPage);