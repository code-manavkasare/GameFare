import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

import {
  goToSettings,
  microphonePermission,
  cameraPermission,
} from '../../../functions/streaming';

class PermissionView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
    };
  }
  async componentDidMount() {
    const {setState} = this.props;
    const cameraAccess = await cameraPermission();
    const microAccess = await microphonePermission();
    this.setState({
      cameraAccess: cameraAccess,
      microAccess: microAccess,
    });
    if (setState) {
      setState({
        permissionsCamera: cameraAccess && microAccess,
        initialLoader: false,
      });
    }
  }
  button(text, active) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !active && goToSettings()}
        style={{...styleApp.center, width: '100%', height: 30}}>
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
    const {microAccess, cameraAccess} = this.state;
    const {initialLoader} = this.props;
    if (initialLoader) {
      return null;
    }
    return (
      <View duration={300} style={styles.page}>
        <View style={styleApp.marginView}>
          <Text
            style={[
              styleApp.subtitle,
              {marginBottom: 20, color: colors.title},
            ]}>
            Enable access to your camera and microphone to start using our
            coaching tool and enhance your performance.
          </Text>
        </View>

        {
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
        }
      </View>
    );
  }
  render() {
    return this.permissionView();
  }
}

const styles = StyleSheet.create({
  page: {
    height: 200,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(
  mapStateToProps,
  {},
)(PermissionView);
