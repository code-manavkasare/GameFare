import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Dimensions,
  Easing,
  Animated,
  TouchableHighlight,
  View,
} from 'react-native';
import colors from '../../style/colors';
import Loader from '../loaders/Loader';
import {timing} from '../../animations/animations';
import styleApp from '../../style/style';
const {height, width} = Dimensions.get('screen');

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColorAnimation: new Animated.Value(0),
    };
    this.AnimatedButton = new Animated.Value(1);
  }
  onPress(val) {
    const {onPressIn, onPressOut} = this.props;
    if (val) {
      if (onPressIn) {
        console.log('asf');
        onPressIn();
      }
      return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation, timing(300, 100)),
      ]).start();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (onPressOut) {
      onPressOut();
    }
    return Animated.parallel([
      Animated.timing(this.state.backgroundColorAnimation, timing(0, 100)),
    ]).start();
  }
  onLongPress() {
    this.props.click();
    this.interval = setInterval(() => this.props.click(), 250);
  }
  render() {
    var color = this.state.backgroundColorAnimation.interpolate({
      inputRange: [0, 300],
      outputRange: [this.props.color, this.props.onPressColor],
    });
    const {pointerEvents, enableLongPress, click} = this.props;
    return (
      <Animated.View
        pointerEvents={pointerEvents}
        style={[this.props.style, {backgroundColor: color}]}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styleApp.center, {width: '100%', height: '100%'}]}
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          onLongPress={enableLongPress ? () => this.onLongPress() : null}
          onPress={click && (() => click())}>
          {this.props.view()}
        </TouchableOpacity>
      </Animated.View>
    );
  }
}
