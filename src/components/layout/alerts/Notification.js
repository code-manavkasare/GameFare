import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  View,
  Image,
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import Mixpanel from 'react-native-mixpanel';
import {mixPanelToken} from '../../database/firebase/tokens';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

import {clickNotification} from '../../../../NavigationService';
import AsyncImage from '../image/AsyncImage';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import {timing, native} from '../../animations/animations';
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

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.notification !== this.props.notification)
      return this.openNotification();
  }
  openNotification() {
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
  static getDerivedStateFromProps(props, state) {
    if (props.notification.senderID !== props.userID)
      return {
        notification: props.notification,
      };
    return {};
  }
  render() {
    const {currentWidth, notification} = this.props;
    if (!notification) return null;
    const {picture} = notification.data;
    let {body, title} = notification.notification;
    if (body.length > 80) body = body.slice(0, 80) + '...';
    const styleImg = {height: 50, width: 50, borderRadius: 5};
    return (
      <Animated.View
        style={[
          styles.notification,
          {width: currentWidth},
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
            Mixpanel.trackWithProperties('Click on notification' + title, {
              userID,
            });
          }}>
          <Row style={styleApp.marginView}>
            <Col size={20} style={styleApp.center2}>
              {!picture ? (
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
              width: currentWidth,
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
    //backgroundColor: 'red',
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
  return {
    notification: state.layout.notification,
    currentWidth: state.layout.currentScreenSize.currentWidth,
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(Notification);
