import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
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
  componentDidUpdate = (prevProps, prevState) => {
    // if (prevProps.isFooterVisible !== this.props.isFooterVisible) {
    //   return this.translateFooter(this.props.isFooterVisible);
    // } else if (prevProps.activeTab !== this.props.activeTab) {
    //   const {routes} = this.props.state;
    //   const index = routes.map((e) => e.name).indexOf(this.props.activeTab);
    //   console.log('activeTab', this.props.activeTab);
    //   return this.translateBlueView(index, routes.length - 1);
    // }
  };
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
      currentScreenSize,
      isFooterVisible,
      userConnected,
    } = this.props;
    console.log('render footer', this.props);
    if (!isFooterVisible || !userConnected) return null;
    const {currentWidth, portrait} = currentScreenSize;
    return (
      <Animated.View
        style={[
          styles.footer,
          styleApp.center3,
          {bottom: portrait ? marginBottomApp : marginBottomAppLandscade},
          {marginLeft: (currentWidth - widthFooter) / 2},
          {transform: [{translateY: this.translateYFooter}]},
        ]}>
        <Row style={{width: '100%'}}>
          <Animated.View
            style={[
              {transform: [{translateX: this.translateXMovingView}]},
              styles.absoluteButtonMoving,
              {width: widthFooter / (state.routes.length - 1)},
            ]}>
            <View style={styles.roundBlueView} />
          </Animated.View>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const {
              icon,
              label,
              signInToPass,
              displayPastille,
              pageStack,
            } = options;
            if (label === 'Session') return null;
            const isFocused = state.index === index;
            return (
              <Col style={[styleApp.center]} key={index}>
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
                  numberRoutes={state.routes.length - 1}
                  translateBlueView={this.translateBlueView.bind(this)}
                  label={label}
                />
              </Col>
            );
          })}
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
    ...styleApp.shade,
    flexDirection: 'row',
    backgroundColor: 'white',
    height: heightFooter,
    position: 'absolute',
    zIndex: 0,
    width: widthFooter,

    borderWidth: 1,
    borderRadius: heightFooter / 2,
    // overflow: 'hidden',
    borderColor: colors.off,
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
    currentScreenSize: state.layout.currentScreenSize,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(Footer);
