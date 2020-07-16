import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import Video from 'react-native-video';
const {height, width} = Dimensions.get('screen');

import {navigate} from '../../../../../../NavigationService';
import Button from '../../../../layout/buttons/Button';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {marginTopApp, marginBottomApp} from '../../../../style/sizes';

export default class LogoutView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async componentDidMount() {}
  logoutView() {
    return (
      <View
        style={[
          styleApp.marginView,
          {
            height: height,
          },
        ]}>
        <Video
          // repeat={true}
          volume={0}
          source={require('../../../../../img/videos/intro.mp4')} // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref;
          }} // Store reference
          style={styles.video}
        />

        <Button
          backgroundColor="green"
          onPressColor={colors.greenLight}
          enabled={true}
          text="Sign in to start"
          icon={{
            name: 'user-circle',
            size: 27,
            type: 'font',
            color: colors.white,
          }}
          styleButton={styles.buttonSignIn}
          loader={false}
          click={async () => navigate('SignIn')}
        />
      </View>
    );
  }
  render() {
    return this.logoutView();
  }
}

const styles = StyleSheet.create({
  video: {
    height: height + 300,
    width: width + 100,
    marginTop: -marginTopApp - 120,
    position: 'absolute',
    zIndex: -1,
    marginBottom: 0,
  },
  buttonSignIn: {
    ...styleApp.shade,
    marginLeft: '5%',
    position: 'absolute',
    bottom: marginBottomApp + 15,
    borderWidth: 0,
    borderColor: colors.off,
    borderRadius: 10,
  },
});
