import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import Animated, {call, block} from 'react-native-reanimated';

import {layoutAction} from '../../../../actions/layoutActions';

import ButtonFooter from './components/Button';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';
import {heightFooter, marginBottomApp} from '../../../style/sizes';
import {clickNotification} from '../../../../../NavigationService';
import styleApp from '../../../style/style';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disableAnimation: false,
    };
    this.cameraVisible = false;
  }
  componentDidMount() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(this);
    }
    this.notificationHandler();
    this.handleCameraAvailability();
  }
  componentDidUpdate(prevProps, prevState) {
    const {index: currentIndex} = this.props.state;
    if (currentIndex !== prevProps.state.index) {
      if (currentIndex !== 1 && prevProps.state.index !== 1) {
        this.smoothJump();
      }
      this.handleCameraAvailability();
    }
  }
  handleCameraAnimated(r) {
    const {layoutAction} = this.props;
    const {disableAnimation} = this.state;
    const {index: currentIndex} = this.props.state;
    const position = r[0];
    if (currentIndex === 1) return;
    if (
      position > 0.05 &&
      position < 1.95 &&
      !this.cameraVisible &&
      !disableAnimation
    ) {
      // console.log(currentIndex, 'SHOW CAMERA ON ANIMATED VALUE');
      this.cameraVisible = true;
      if (this.cameraAvailability) {
        // console.log('clear timeout');
        clearTimeout(this.cameraAvailability);
      }
      layoutAction('setCameraAvailability', true);
    } else if (
      (position < 0.05 || position > 1.95) &&
      this.cameraVisible &&
      !disableAnimation
    ) {
      if (this.cameraAvailability) {
        // console.log('clear timeout');
        clearTimeout(this.cameraAvailability);
      }
      // console.log(currentIndex, 'HIDE CAMERA ON ANIMATED VALUE');
      this.cameraVisible = false;
      this.cameraAvailability = setTimeout(() => {
        this.cameraVisible = false;
        // console.log('done hiding');
        layoutAction('setCameraAvailability', false);
      }, 1000);
    }
  }
  handleCameraAvailability() {
    const {layoutAction} = this.props;
    const {index: currentIndex} = this.props.state;
    if (this.cameraAvailability) {
      // console.log('clear timeout');
      clearTimeout(this.cameraAvailability);
    }
    if (currentIndex === 1) {
      // console.log('SHOW CAMERA ON INDEX VALUE');
      this.cameraVisible = true;
      layoutAction('setCameraAvailability', true);
    } else {
      // console.log('HIDE CAMERA ON INDEX VALUE');
      // console.log('set timeout');
      this.cameraVisible = false;
      this.cameraAvailability = setTimeout(() => {
        this.cameraVisible = false;
        // console.log('done hiding');
        layoutAction('setCameraAvailability', false);
      }, 1000);
    }
  }
  smoothJump() {
    this.setState({disableAnimation: true});
    setTimeout(() => {
      this.setState({disableAnimation: false});
    }, 250);
  }
  async notificationHandler() {
    const {layoutAction: propLayoutAction, userID} = this.props;

    messaging().onMessage((remoteMessage) => {
      if (!remoteMessage.from && remoteMessage.data.senderID !== userID) {
        return propLayoutAction('setLayout', {notification: remoteMessage});
      }
    });
    this.appBackgroundNotificationListenner();
    this.appOpenFistNotification();
  }
  appBackgroundNotificationListenner() {
    this.removeNotificationListener = messaging().onNotificationOpenedApp(
      (notification) => {
        clickNotification(notification);
      },
    );
  }
  async appOpenFistNotification() {
    const notificationOpen = await messaging().getInitialNotification();
    if (notificationOpen) {
      return clickNotification(notificationOpen);
    }
  }
  backdrop() {
    const {state, position} = this.props;
    const {disableAnimation} = this.state;
    let inputRange = state.routes.map((_, i) => i);
    inputRange.unshift(-1);
    inputRange.push(state.routes.length);
    const wrappedPosition = block([
      call([position], (r) => this.handleCameraAnimated(r)),
      position,
    ]);
    const translateYFooter = Animated.interpolate(wrappedPosition, {
      inputRange,
      outputRange: inputRange.map((i) =>
        i === 1 && !disableAnimation
          ? sizes.heightFooter + sizes.marginBottomApp
          : 0,
      ),
    });
    return (
      <Animated.View
        style={{
          ...styles.backdrop,
          transform: [{translateY: translateYFooter}],
        }}
      />
    );
  }
  labelIndicator() {
    const {state, position, currentScreenSize} = this.props;
    const {disableAnimation} = this.state;
    const {currentWidth} = currentScreenSize;
    const indicatorWidth = 50;
    let inputRange = state.routes.map((_, i) => i);
    inputRange.unshift(-1);
    inputRange.push(3);
    const translateXIndicator = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map(
        (i) =>
          (i * (sizes.width * 0.85)) / state.routes.length -
          indicatorWidth / 2 +
          currentWidth * 0.2175 +
          (0.85 * (currentWidth - sizes.width)) / state.routes.length,
      ),
    });
    const widthIndicator = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map((i) => {
        return i === 1 ? indicatorWidth : indicatorWidth;
      }),
    });
    const opacityIndicator = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map((i) => {
        return i === 1 && !disableAnimation ? 0 : 0;
      }),
    });

    const indicatorStyle = {
      ...styles.labelIndicator,
      width: widthIndicator,
      opacity: opacityIndicator,
      transform: [{translateX: translateXIndicator}],
    };

    return (
      <View style={styles.labelIndicatorContainer}>
        <Animated.View style={indicatorStyle} />
      </View>
    );
  }
  footer = () => {
    const {
      state,
      descriptors,
      navigation,
      colors: propColors,
      userConnected,
      position,
      currentSessionID,
    } = this.props;
    const {disableAnimation} = this.state;

    return (
      <View style={styles.footer}>
        <Row style={styles.footerBody}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const {
              icon,
              label,
              hideInFooter,
              signInToPass,
              displayPastille,
              pageStack,
            } = options;
            if (hideInFooter) {
              return null;
            }
            const isFocused = state.index === index;
            let inputRange = state.routes.map((_, i) => i);
            inputRange.unshift(-1);
            inputRange.push(state.routes.length);
            const inSession = currentSessionID && index === 1;
            const buttonColor = Animated.interpolateColors(position, {
              inputRange,
              outputColorRange: inputRange.map((i) => {
                if (i === 1 && !disableAnimation) {
                  return index === 1 ? colors.white : colors.greyLight;
                } else {
                  return inSession
                    ? colors.grey
                    : index === i && index !== 1
                    ? colors.blue
                    : propColors.inactive;
                }
              }),
            });
            const inSessionIndication = Animated.interpolate(position, {
              inputRange,
              outputRange: inputRange.map((i) => {
                return i === 1 && !disableAnimation ? 0 : 1;
              }),
            });
            const scale =
              index === 1 &&
              Animated.interpolate(position, {
                inputRange,
                outputRange: inputRange.map((i) => (i === 1 ? 1 : 0.7)),
              });
            return (
              <Col key={index}>
                <ButtonFooter
                  disableAnimation={disableAnimation}
                  navigation={navigation}
                  isFocused={isFocused}
                  tintColor={buttonColor}
                  routeName={route.name}
                  pageStack={pageStack}
                  displayPastille={displayPastille}
                  signInToPass={signInToPass}
                  icon={icon}
                  scale={scale}
                  index={index}
                  numberRoutes={state.routes.length - 2}
                  label={label}
                  inSession={inSession}
                  inSessionIndication={inSessionIndication}
                />
              </Col>
            );
          })}
        </Row>
        {this.labelIndicator()}
        {this.backdrop()}
      </View>
    );
  };

  render() {
    return this.footer();
  }
}

const styles = StyleSheet.create({
  footer: {
    // ...styleApp.shadowWeak,
    ...styleApp.center2,
    flexDirection: 'row',
    height: heightFooter + marginBottomApp + 30,
    position: 'absolute',
    zIndex: 1,
    width: '100%',

    bottom: 0,
    overflow: 'visible',
  },
  backdrop: {
    ...styleApp.shadowWeak,
    ...styleApp.center2,
    borderTopWidth: 1,
    borderColor: colors.off,
    flexDirection: 'row',
    height: heightFooter + marginBottomApp,
    position: 'absolute',
    zIndex: -1,
    width: '100%',
    bottom: 0,
    backgroundColor: colors.white,
  },
  footerBody: {
    ...styleApp.fullSize,
    overflow: 'hidden',
    width: sizes.width * 0.85,
    marginTop: 0,
    paddingTop: 15,
    zIndex: 2,
  },
  absoluteButtonMoving: {
    ...styleApp.center,
    height: '100%',
    borderRadius: 25,
    position: 'absolute',
  },
  roundBlueView: {
    height: 55,
    backgroundColor: colors.primary,
    width: 55,
    borderRadius: heightFooter / 2,
  },
  labelIndicatorContainer: {
    position: 'absolute',
    height: 5,
    bottom: sizes.marginBottomApp - 10,
    width: '100%',
    zIndex: 0,
  },
  labelIndicator: {
    borderRadius: 10,
    backgroundColor: colors.blueLight,
    // left: 0,
    position: 'absolute',
    height: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    isFooterVisible: state.layout.isFooterVisible,
    currentSessionID: state.coach.currentSessionID,
    activeTab: state.layout.activeTab,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Footer);
