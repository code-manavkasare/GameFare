import React from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from 'react-native';
import {BlurView, VibrancyView} from '@react-native-community/blur';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import messaging from '@react-native-firebase/messaging';

import {layoutAction} from '../../../../actions/layoutActions';

import ButtonFooter from './components/Button';
import colors from '../../../style/colors';
import {
  heightFooter,
  marginBottomApp,
  marginBottomAppLandscade,
} from '../../../style/sizes';
import {native} from '../../../animations/animations';
import {clickNotification} from '../../../../../NavigationService';
import styleApp from '../../../style/style';

const widthFooter = 290;

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.translateYFooter = new Animated.Value(0);
    this.translateXMovingView = new Animated.Value(0);
  }
  componentDidMount() {
    this.notificationHandler();
  }
  async notificationHandler() {
    const {layoutAction, userID} = this.props;

    const unsubscribe = messaging().onMessage((remoteMessage) => {
      if (!remoteMessage.from && remoteMessage.data.senderID !== userID)
        return layoutAction('setLayout', {notification: remoteMessage});
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
    if (notificationOpen) return clickNotification(notificationOpen);
  }
  translateFooter = (open) => {
    return Animated.timing(
      this.translateYFooter,
      native(open ? 0 : 200, 200),
    ).start();
  };
  setActiveRoute(nextTab) {
    const {layoutAction} = this.props;
    layoutAction('setLayout', {activeTab: nextTab});
  }
  translateBlueView = (index, numberRoutes) => {
    const translateTo = (widthFooter / numberRoutes) * Number(index);
    return Animated.spring(
      this.translateXMovingView,
      native(translateTo, 100),
    ).start();
  };

  footer = () => {
    const {
      state,
      descriptors,
      navigation,
      colors,
      isFooterVisible,
      userConnected,
    } = this.props;
    if (!isFooterVisible || !userConnected) return null;
    // if (!userConnected) return null;
    const {width} = Dimensions.get('screen');
    return (
      <Animated.View
        style={[
          styles.footer,
          // styleApp.center3,
          {bottom: 0},
          // {marginLeft: (width - widthFooter) / 2},
          {transform: [{translateY: this.translateYFooter}]},
        ]}>
        <Row style={styles.footerBody}>
          {/* <Animated.View
            style={[
              {transform: [{translateX: this.translateXMovingView}]},
              styles.absoluteButtonMoving,
              {width: widthFooter / (state.routes.length - 2)},
            ]}>
            <View style={styles.roundBlueView} />
          </Animated.View> */}
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
            if (hideInFooter) return null;
            const isFocused = state.index === index;
            return (
              <Col key={index}>
                <ButtonFooter
                  navigation={navigation}
                  isFocused={isFocused}
                  tintColor={isFocused ? colors.active : colors.inactive}
                  routeName={route.name}
                  pageStack={pageStack}
                  displayPastille={displayPastille}
                  signInToPass={signInToPass}
                  icon={icon}
                  index={index}
                  numberRoutes={state.routes.length - 2}
                  translateBlueView={this.translateBlueView.bind(this)}
                  label={label}
                />
              </Col>
            );
          })}
          {/* {<BlurView
            style={{position:'absolute', zIndex:-1, ...styleApp.fullSize, top:0}}
            blurType="light"
            blurAmount={20}
          />} */}
        </Row>
      </Animated.View>
    );
  };
  render() {
    return this.footer();
  }
}

const styles = StyleSheet.create({
  footer: {
    ...styleApp.shadowWeak,
    flexDirection: 'row',
    height: heightFooter + marginBottomApp,
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    borderRadius: 35,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.off,
  },
  footerBody: {
    ...styleApp.fullSize,
    borderRadius: 33,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    borderColor: colors.off,
    overflow: 'hidden',
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
