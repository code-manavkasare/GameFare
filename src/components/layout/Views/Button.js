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
import {BlurView} from '@react-native-community/blur';
import colors from '../../style/colors';
import Loader from '../loaders/Loader';
import {native, timing} from '../../animations/animations';
import styleApp from '../../style/style';
const {height, width} = Dimensions.get('screen');

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColorAnimation: new Animated.Value(0),
      loading: false,
    };
    this.AnimatedButton = new Animated.Value(1);
    this.loadingOpacity = new Animated.Value(0);
  }
  componentDidMount() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(this);
    }
  }
  setLoading(loading) {
    this.setState({loading});
    Animated.timing(this.loadingOpacity, native(loading ? 1 : 0)).start();
  }
  onPress(val) {
    const {onPressIn, onPressOut} = this.props;
    if (val) {
      if (onPressIn) {
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
  loading() {
    const {loading} = this.state;
    const {loaderColor} = this.props;
    return loading ? (
      <Loader size={30} color={loaderColor ? loaderColor : colors.greyDarker} />
    ) : null;
  }
  render() {
    const {
      color: defaultColorProp,
      onPressColor: onPressColorProp,
    } = this.props;
    const defaultColor =
      defaultColorProp === 'blur' ? 'transparent' : defaultColorProp;
    const onPressColor =
      defaultColorProp === 'blur' ? colors.greyDark + '20' : onPressColorProp;
    var color =
      defaultColorProp === 'blur'
        ? 'transparent'
        : this.state.backgroundColorAnimation.interpolate({
            inputRange: [0, 300],
            outputRange: [defaultColor, onPressColor],
          });
    const blurViewStyle = {
      ...styleApp.fullSize,
      position: 'absolute',
      zIndex: -2,
    };
    const {pointerEvents, enableLongPress, click} = this.props;
    const bodyOpacity = this.loadingOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
    return (
      <Animated.View
        pointerEvents={pointerEvents}
        style={[
          this.props.style,
          {
            backgroundColor: color,
            overflow: defaultColorProp === 'blur' ? 'hidden' : 'visible',
          },
        ]}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styleApp.center, styleApp.fullSize]}
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          onLongPress={enableLongPress ? () => this.onLongPress() : null}
          onPress={click && (() => click())}>
          <Animated.View
            style={{
              opacity: bodyOpacity,
              ...styleApp.fullSize,
              ...styleApp.center,
            }}>
            {this.props.view()}
          </Animated.View>
          <Animated.View
            style={{
              ...styleApp.fullSize,
              ...styleApp.center,
              position: 'absolute',
              opacity: this.loadingOpacity,
            }}>
            {this.loading()}
          </Animated.View>
        </TouchableOpacity>
        {defaultColorProp === 'blur' ? (
          <BlurView style={blurViewStyle} blurType="dark" blurAmount={5} />
        ) : null}
      </Animated.View>
    );
  }
}
