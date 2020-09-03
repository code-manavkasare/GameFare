import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import Animated from 'react-native-reanimated';

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
  }
  componentDidMount() {
    this.props.onRef(this);
    this.notificationHandler();
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
  footer = () => {
    const {
      state,
      descriptors,
      navigation,
      colors: propColors,
      userConnected,
      position,
    } = this.props;
    if (!userConnected) {
      return null;
    }
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
            const buttonColor = Animated.interpolateColors(position, {
              inputRange,
              outputColorRange: inputRange.map((i) => {
                if (i === 1) {
                  return index === 1 ? colors.white : colors.grey;
                } else {
                  return propColors.inactive;
                }
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
                />
              </Col>
            );
          })}
        </Row>
        {this.labelIndicator()}
        {this.backdrop()}
        {/* {
          <BlurView
            style={{
              position: 'absolute',
              zIndex: -1,
              ...styleApp.fullSize,
              top: 0,
            }}
            blurType="light"
            blurAmount={20}
          />
        } */}
      </View>
    );
  };
  backdrop() {
    const {state, position} = this.props;
    let inputRange = state.routes.map((_, i) => i);
    inputRange.unshift(-1);
    inputRange.push(state.routes.length);
    const translateYFooter = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map((i) =>
        i === 1 ? sizes.heightFooter + sizes.marginBottomApp : 0,
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
    const {state, position} = this.props;
    let inputRange = state.routes.map((_, i) => i);
    inputRange.unshift(-1);
    inputRange.push(3);
    const translateXIndicator = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map((i) => i * 106),
    });
    const widthIndicator = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map((i) => {
        return i === 1 ? 50 : 50;
      }),
    });
    const opacityIndicator = Animated.interpolate(position, {
      inputRange,
      outputRange: inputRange.map((i) => {
        return i === 1 ? 0 : 1;
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
  render() {
    return this.footer();
  }
}

const styles = StyleSheet.create({
  footer: {
    ...styleApp.shadowWeak,
    ...styleApp.center,
    flexDirection: 'row',
    height: heightFooter + marginBottomApp + 15,
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    bottom: 0,
    overflow: 'visible',
  },
  backdrop: {
    ...styleApp.shadowWeak,
    ...styleApp.center2,
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
    width: '85%',
    marginTop: -15,
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
    width: '70%',
  },
  labelIndicator: {
    borderRadius: 10,
    backgroundColor: colors.blueLight,
    left: 0,
    position: 'absolute',
    height: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    isFooterVisible: state.layout.isFooterVisible,
    activeTab: state.layout.activeTab,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Footer);
