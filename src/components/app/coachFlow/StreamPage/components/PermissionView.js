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
import FadeInView from 'react-native-fade-in-view';
const {height, width} = Dimensions.get('screen');

import {
  goToSettings,
  microphonePermission,
  cameraPermission,
} from '../../../../functions/streaming';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

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
    const {setState} = this.props;
    const cameraAccess = await cameraPermission();
    const microAccess = await microphonePermission();
    this.setState({
      loader: false,
      cameraAccess: cameraAccess,
      microAccess: microAccess,
    });
    if (setState) setState({permissionsCamera: cameraAccess && microAccess});
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
      <FadeInView duration={300} style={styles.page}>
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

const styles = StyleSheet.create({
  page: {
    //  flex: 1,
    ...styleApp.center,
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
)(StreamPage);
