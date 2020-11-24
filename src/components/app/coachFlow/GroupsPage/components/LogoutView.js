import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import Video from 'gamefare-rn-video';

const {height, width} = Dimensions.get('screen');

import {navigate} from '../../../../../../NavigationService';
import {native} from '../../../../animations/animations';
import Button from '../../../../layout/buttons/Button';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {marginTopApp, marginBottomApp} from '../../../../style/sizes';
import {timeout} from '../../../../functions/coach';
import Loader from '../../../../layout/loaders/Loader';

export default class LogoutView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: true,
      displayVideo: false,
    };
    this.fadeInAnimation = new Animated.Value(1);
  }
  async componentDidMount() {
    await StatusBar.setBarStyle('light-content', true);
    this.setState({displayVideo: true});
    await timeout(500);
    this.fadeIn();
  }

  fadeIn() {
    Animated.timing(this.fadeInAnimation, native(0, 600)).start();
  }

  loader() {
    return (
      <Animated.View
        style={{...styles.loadingView, opacity: this.fadeInAnimation}}>
        <View
          style={[
            styleApp.center,
            {height: 100, width: width, marginBottom: 0},
          ]}>
          <Animated.Image
            style={{width: 40, height: 40, position: 'absolute'}}
            source={require('../../../../../img/logos/logoWhite.png')}
          />
        </View>
        <View style={{position: 'absolute'}}>
          <Loader color={colors.white} size={100} type={2} speed={2.2} />
        </View>
      </Animated.View>
    );
  }

  logoutView() {
    const {paused, displayVideo} = this.state;
    const opacity = this.fadeInAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });

    const videoStyle = () => {
      let videoWidth = height * (9 / 16);
      let videoHeight = height;
      if (videoWidth < width) {
        videoWidth = width;
        videoHeight = width * (16 / 9);
      }
      const video = {
        width: videoWidth,
        height: videoHeight,
      };
      return {
        ...video,
        ...styles.video,
      };
    };

    return (
      <View
        style={[
          styleApp.fullSize,
          {
            height: height,
          },
        ]}>
        {this.loader()}
        {displayVideo ? (
          <Video
            repeat={true}
            paused={paused}
            volume={0}
            source={require('../../../../../img/videos/intro-loop.mp4')} // Can be a URL or a local file.
            ref={(ref) => {
              this.player = ref;
            }}
            onLoad={() => this.setState({paused: false})}
            style={videoStyle()}
          />
        ) : null}
        <Animated.View style={{...styles.logoContainer, opacity}}>
          <Animated.Image
            style={{width: 230, height: 50, position: 'absolute'}}
            source={require('../../../../../img/logos/logoTitle.png')}
          />
        </Animated.View>
        <Animated.View style={{...styles.buttonContainer, opacity}}>
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
        </Animated.View>
      </View>
    );
  }
  render() {
    return this.logoutView();
  }
}

const styles = StyleSheet.create({
  video: {
    top: 0,
    position: 'absolute',
    zIndex: -1,
    marginBottom: 0,
  },
  buttonSignIn: {
    ...styleApp.shade,
    borderWidth: 0,
    borderColor: colors.off,
    borderRadius: 10,
  },
  buttonContainer: {
    marginLeft: '5%',
    marginRight: '5%',
    position: 'absolute',
    bottom: marginBottomApp + 15,
    width: '90%',
  },
  logoContainer: {
    ...styleApp.fullSize,
    ...styleApp.center,
    height: height * 0.12,
    top: marginTopApp,
    position: 'absolute',
  },
  loadingView: {
    ...styleApp.fullSize,
    ...styleApp.center,
    width,
    position: 'absolute',
    backgroundColor: colors.blue,
  },
});
