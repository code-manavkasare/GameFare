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
import {BlurView} from '@react-native-community/blur';

import {logMixpanel} from '../../functions/logs';
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
      loading: false,
    };
    this.AnimatedButton = new Animated.Value(1);
  }
  componentDidMount() {
    const {loadRef} = this.props;
    if (loadRef) {
      loadRef(this.setLoading);
    }
  }
  setLoading(loading) {
    this.setState({loading});
  }
  click() {
    const {click, text} = this.props;
    logMixpanel({label: 'Click ' + text, params: {}});
    click();
  }
  widthButton() {
    if (this.props.width) {
      return this.props.width;
    }
    return width - 40;
  }
  styleButton() {
    if (this.props.disabled) {
      return {
        ...styles.buttonSubmit,
        backgroundColor: 'white',
        borderColor: colors.off,
        borderWidth: 1,
        ...this.props.styleButton,
      };
    }
    if (this.props.styleButton) {
      return {
        ...styles.buttonSubmit,
        ...this.props.styleButton,
        backgroundColor: colors[this.props.backgroundColor],
      };
    }
    return {
      ...styles.buttonSubmit,
      backgroundColor: colors[this.props.backgroundColor],
    };
  }
  onPressColor() {
    if (this.props.onPressColor) {
      return this.props.onPressColor;
    }
    return colors.primary2;
  }
  styleText() {
    if (this.props.disabled) {
      return {
        ...styles.textButtonOn,
        ...this.props.styleText,
        color: colors[this.props.backgroundColor],
      };
    }
    if (this.props.textButton) {
      return {...styles.textButtonOn, ...this.props.textButton};
    }
    return styles.textButtonOn;
  }
  onPress(val) {
    if (val) {
      return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation, timing(300, 100)),
      ]).start();
    }
    return Animated.parallel([
      Animated.timing(this.state.backgroundColorAnimation, timing(0, 100)),
    ]).start();
  }
  iconView() {
    const {icon, loader} = this.props;
    const {loading} = this.state;
    const {name, size, type, color} = icon;
    const containerIcon = {
      ...styleApp.center,
      position: 'absolute',
      height: '100%',
      width: 70,
    };
    return (
      <View style={containerIcon}>
        {loader || loading ? (
          <Loader size={34} color={colors.white} />
        ) : (
          <AllIcon name={name} size={size} type={type} color={color} />
        )}
      </View>
    );
  }
  render() {
    var color = this.state.backgroundColorAnimation.interpolate({
      inputRange: [0, 300],
      outputRange: [this.styleButton().backgroundColor, this.onPressColor()],
    });
    const {disabled, loader, text, icon, loaderSize} = this.props;
    const {loading} = this.state;
    const blurViewStyle = {
      ...styleApp.fullSize,
      position: 'absolute',
      zIndex: -1,
      borderRadius: 15,
    };
    return (
      <Animated.View style={[this.styleButton(), {backgroundColor: color}]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styleApp.fullSize}
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          disabled={disabled}
          onPress={() => !(loader || loading) && this.click()}>
          {icon ? this.iconView() : null}
          <View style={[styleApp.center, styleApp.fullSize]}>
            {(loader || loading) && !icon ? (
              <Loader
                size={loaderSize ? loaderSize : 38}
                color={colors.white}
              />
            ) : (
              <Text style={this.styleText()}>{text}</Text>
            )}
          </View>
        </TouchableOpacity>
        {this.props.backgroundColor === 'blur' ? (
          <BlurView style={blurViewStyle} blurType="dark" blurAmount={5} />
        ) : null}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  buttonSubmit: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 15,
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
