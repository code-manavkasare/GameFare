import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  View,
  Image,
  Dimensions,
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import {updateNotificationBadge} from '../../functions/notifications.js';
import {boolShouldComponentUpdate} from '../../functions/redux'
import {
  clickNotification,
  getCurrentRoute,
} from '../../../../NavigationService';
import {logMixpanel} from '../../functions/logs';
import AsyncImage from '../image/AsyncImage';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import {timing} from '../../animations/animations';
import {timeout} from '../../functions/coach';

import {marginTopApp} from '../../style/sizes';

const heightNotif = 130;
const initialTranslateY = -marginTopApp - heightNotif - 20;

class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      notification: false,
      open: false,
    };
    this.translateYNotif = new Animated.Value(initialTranslateY);
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.dy < 0) this.translateYNotif.setValue(gestureState.dy);
      },
      onPanResponderRelease: () => {
        if (this.translateYNotif._value < -20)
          return this.close(initialTranslateY);
        return this.close(0);
      },
    });
  }
  shouldComponentUpdate(nextProps,nextState) {
    return boolShouldComponentUpdate({props:this.props,nextProps,state:this.state,nextState})
  }

  static getDerivedStateFromProps(props, state) {
    if (props.notification.senderID !== props.userID)
      return {
        notification: props.notification,
      };
    return {};
  }

  componentDidUpdate(prevProps, prevState) {
    const {notification, notifications} = this.props;
    if (prevProps.notification !== notification) {
      notification.data.action === 'Conversation' &&
        updateNotificationBadge(notifications.length + 1);
      return this.openNotification();
    }
  }

  openNotification() {
    const {notification} = this.props;
    const {action} = notification.data;
    const currentRoute = getCurrentRoute();
    if (action !== currentRoute)
      Animated.timing(this.translateYNotif, timing(0, 400)).start(async () => {
        await timeout(4000);
        this.close(initialTranslateY);
      });
  }

  close(translateValue, click) {
    Animated.timing(this.translateYNotif, timing(translateValue, 200)).start(
      () => click && click(),
    );
  }

  render() {
    const {notification} = this.props;
    const {width} = Dimensions.get('screen');
    if (!notification) return null;
    const {picture} = notification.data;
    //console.log('notification: ', notification);
    let {body, title} = notification.notification;
    if (body.length > 80) body = body.slice(0, 80) + '...';
    const styleImg = {height: 50, width: 50, borderRadius: 5};
    return (
      <Animated.View
        style={[
          styles.notification,
          {width: width},
          {transform: [{translateY: this.translateYNotif}]},
        ]}>
        <TouchableOpacity
          style={styleApp.fullSize}
          activeOpacity={1}
          onPress={() => {
            const {userID} = this.props;
            this.close(initialTranslateY, () =>
              clickNotification(notification),
            );
            logMixpanel({label: 'Click on notification' + title, params: {}});
          }}>
          <Row style={styleApp.marginView}>
            <Col size={20} style={styleApp.center2}>
              {!picture || picture === 'false' ? (
                <Image
                  source={require('../../../img/logos/logoios.png')}
                  style={styleImg}
                />
              ) : (
                <AsyncImage mainImage={picture} style={styleImg} />
              )}
            </Col>
            <Col size={80} style={styleApp.center2}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{body}</Text>
            </Col>
          </Row>
        </TouchableOpacity>
        <Animated.View
          {...this._panResponder.panHandlers}
          style={[
            styles.swipableView,
            {
              width: width,
            },
          ]}>
          <View style={styles.swipableRectangle} />
        </Animated.View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    top: 0,
    height: heightNotif,
    paddingTop: marginTopApp,
    borderBottomWidth: 1,
    borderColor: colors.off,
    backgroundColor: colors.white,
    ...styleApp.shade,
  },
  swipableView: {
    ...styleApp.center,
    position: 'absolute',
    bottom: -20,
    height: 20,
    paddingTop: 0,
  },
  swipableRectangle: {
    height: 4,
    width: 50,
    borderRadius: 2.5,
    backgroundColor: colors.transparentGrey,
  },
  subtitle: {
    ...styleApp.text,
    fontSize: 14,
    color: colors.title,
    marginTop: 3,
  },
  title: {...styleApp.title, fontSize: 15},
});

const mapStateToProps = (state) => {
  const {notifications} = state.user.infoUser;
  return {
    notification: state.layout.notification,
    userID: state.user.userID,
    notifications: notifications ? Object.values(notifications) : [],
  };
};

export default connect(
  mapStateToProps,
  {},
)(Notification);
