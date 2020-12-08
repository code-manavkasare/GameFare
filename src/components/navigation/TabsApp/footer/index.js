import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import Animated, {call, block} from 'react-native-reanimated';

import {layoutAction} from '../../../../store/actions/layoutActions';
import {boolShouldComponentUpdate} from '../../../functions/redux';

import FooterButton from './components/Button';
import colors from '../../../style/colors';
import {heightFooter, marginBottomApp} from '../../../style/sizes';
import {clickNotification} from '../../../../../NavigationService';
import styleApp from '../../../style/style';
import {currentSessionIDSelector} from '../../../../store/selectors/sessions';
import {userIDSelector} from '../../../../store/selectors/user';
import {currentScreenSizeSelector} from '../../../../store/selectors/layout';

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
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'Footer app',
    });
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
      this.cameraVisible = true;
      if (this.cameraAvailability) {
        clearTimeout(this.cameraAvailability);
      }
      layoutAction('setCameraAvailability', true);
    } else if (
      (position < 0.05 || position > 1.95) &&
      this.cameraVisible &&
      !disableAnimation
    ) {
      if (this.cameraAvailability) {
        clearTimeout(this.cameraAvailability);
      }
      this.cameraVisible = false;
      this.cameraAvailability = setTimeout(() => {
        this.cameraVisible = false;
        layoutAction('setCameraAvailability', false);
      }, 1000);
    }
  }
  handleCameraAvailability() {
    const {layoutAction} = this.props;
    const {index: currentIndex} = this.props.state;
    if (this.cameraAvailability) {
      clearTimeout(this.cameraAvailability);
    }
    if (currentIndex === 1) {
      this.cameraVisible = true;
      layoutAction('setCameraAvailability', true);
    } else {
      this.cameraVisible = false;
      this.cameraAvailability = setTimeout(() => {
        this.cameraVisible = false;
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
  animatedValues() {
    const {state, position} = this.props;
    const {disableAnimation} = this.state;
    let inputRange = state.routes.map((_, i) => i);
    const wrappedPosition = block([
      call([position], (r) => this.handleCameraAnimated(r)),
      position,
    ]);
    const heightContainer = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map((i) => {
        return i === 1
          ? heightFooter + marginBottomApp + 30
          : heightFooter + marginBottomApp;
      }),
      extrapolate: 'clamp',
    });
    const paddingTopContainer = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map((i) => {
        return i === 1 ? 30 : 0;
      }),
      extrapolate: 'clamp',
    });
    const translateYBackdrop = Animated.interpolate(wrappedPosition, {
      inputRange,
      outputRange: inputRange.map((i) =>
        i === 1 && !disableAnimation ? heightFooter + marginBottomApp : 0,
      ),
      extrapolate: 'clamp',
    });
    return {
      heightContainer,
      paddingTopContainer,
      translateYBackdrop,
    };
  }
  backdrop() {
    const {translateYBackdrop: translateY} = this.animatedValues();
    const animatedStyle = {
      ...styles.backdrop,
      transform: [{translateY}],
    };
    return <Animated.View style={animatedStyle} />;
  }
  footer = () => {
    const {
      state,
      descriptors,
      navigation,
      colors: propColors,
      position,
      currentSessionID,
    } = this.props;
    const {disableAnimation} = this.state;
    const {width: currentWidth} = Dimensions.get('screen');
    const {
      heightContainer: height,
      paddingTopContainer: paddingTop,
    } = this.animatedValues();
    return (
      <Animated.View
        style={[styles.footer, {width: currentWidth, height, paddingTop}]}>
        <Row style={[styles.footerBody, {width: currentWidth * 0.85}]}>
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
              extrapolate: 'clamp',
            });
            const inSessionIndication = Animated.interpolate(position, {
              inputRange,
              outputRange: inputRange.map((i) => {
                return i === 1 && !disableAnimation ? 0 : 1;
              }),
              extrapolate: 'clamp',
            });
            const scale =
              index === 1 &&
              Animated.interpolate(position, {
                inputRange,
                outputRange: inputRange.map((i) => (i === 1 ? 1 : 0.7)),
                extrapolate: 'clamp',
              });
            return (
              <Col key={index}>
                <FooterButton
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
        {this.backdrop()}
      </Animated.View>
    );
  };

  render() {
    return this.footer();
  }
}

const styles = StyleSheet.create({
  footer: {
    ...styleApp.center2,
    flexDirection: 'row',
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
    marginTop: 0,
    paddingTop: 5,
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
    bottom: marginBottomApp - 10,
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
    currentSessionID: currentSessionIDSelector(state),
    userID: userIDSelector(state),
    currentScreenSize: currentScreenSizeSelector(state),
  };
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Footer);
