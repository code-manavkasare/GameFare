import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  View,
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import {clickNotification} from '../../../../NavigationService';
import AsyncImage from '../image/AsyncImage';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import {timing, native} from '../../animations/animations';
import {timeout} from '../../functions/coach';

import {marginTopApp} from '../../style/sizes';

const heightNotif = 100;

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
        if (gestureState.dy < 10)
          this.translateYNotif.setValue(gestureState.dy);
      },
      onPanResponderRelease: () => {
        if (this.translateYNotif._value < 0)
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
  close(translateValue) {
    Animated.timing(this.translateYNotif, timing(translateValue, 200)).start();
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
    const {body, title, image} = notification.notification;
    console.log('render notif', notification);
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
            this.close(initialTranslateY);
            clickNotification(notification);
          }}>
          <Row style={styleApp.marginView}>
            <Col size={15} style={styleApp.center2}>
              <AsyncImage
                mainImage={image}
                style={{height: 30, width: 30, borderRadius: 5}}
              />
            </Col>
            <Col size={85} style={styleApp.center2}>
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
    height: 50,
    paddingTop: 30,
  },
  swipableRectangle: {
    height: 3,
    width: 80,
    borderRadius: 2.5,
    backgroundColor: colors.transparentGrey,
  },
  subtitle: {...styleApp.title, fontSize: 12, color: colors.greyDark},
  title: {...styleApp.title, fontSize: 14},
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
