import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Dimensions,
  View,
  Animated,
} from 'react-native';
import colors from '../../style/colors';
import Loader from '../loaders/Loader';
import {timing} from '../../animations/animations';
import styleApp from '../../style/style';
import AllIcon from '../icons/AllIcons';
const {width} = Dimensions.get('screen');

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColorAnimation: new Animated.Value(0),
    };
    this.AnimatedButton = new Animated.Value(1);
  }
  click() {
    this.props.click();
  }
  widthButton() {
    if (this.props.width) return this.props.width;
    return width - 40;
  }
  styleButton() {
    if (this.props.disabled)
      return {
        ...styles.buttonSubmit,
        backgroundColor: 'white',
        borderColor: colors.off,
        borderWidth: 1,
        ...this.props.styleButton,
      };
    if (this.props.styleButton)
      return {
        ...styles.buttonSubmit,
        ...this.props.styleButton,
        backgroundColor: colors[this.props.backgroundColor],
      };
    return {
      ...styles.buttonSubmit,
      backgroundColor: colors[this.props.backgroundColor],
    };
  }
  onPressColor() {
    if (this.props.onPressColor) return this.props.onPressColor;
    return colors.primary2;
  }
  styleText() {
    if (this.props.disabled)
      return {
        ...styles.textButtonOn,
        ...this.props.styleText,
        color: colors[this.props.backgroundColor],
      };
    if (this.props.textButton)
      return {...styles.textButtonOn, ...this.props.textButton};
    return styles.textButtonOn;
  }
  onPress(val) {
    if (val)
      return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation, timing(300, 100)),
      ]).start();
    return Animated.parallel([
      Animated.timing(this.state.backgroundColorAnimation, timing(0, 100)),
    ]).start();
  }
  iconView() {
    const {icon} = this.props;
    const {name, size, type, color} = icon;
    const containerIcon = {
      ...styleApp.center,
      position: 'absolute',
      height: '100%',
      width: 70,
    };
    return (
      <View style={containerIcon}>
        <AllIcon name={name} size={size} type={type} color={color} />
      </View>
    );
  }
  render() {
    var color = this.state.backgroundColorAnimation.interpolate({
      inputRange: [0, 300],
      outputRange: [this.styleButton().backgroundColor, this.onPressColor()],
    });
    const {click, disabled, loader, text, icon} = this.props;
    return (
      <Animated.View style={[this.styleButton(), {backgroundColor: color}]}>
        <TouchableOpacity
          activeOpacity={1}
          style={[{width: '100%', height: '100%'}]}
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          disabled={disabled}
          onPress={() => !loader && click()}>
          {icon && this.iconView()}
          <View style={[styleApp.center, styleApp.fullSize]}>
            {loader ? (
              <Loader size={38} color={colors.white} />
            ) : (
              <Text style={this.styleText()}>{text}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  buttonSubmit: {
    height: 62,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: colors.borderColor,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    shadowOpacity: 0.04,
  },
  textButtonOn: {
    ...styleApp.textBold,
    fontSize: 18,
    color: colors.white,
  },
});
