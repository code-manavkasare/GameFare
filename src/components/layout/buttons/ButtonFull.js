import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  Animated,
  TouchableHighlight,
  View,
} from 'react-native';
import colors from '../../style/colors';
import Loader from '../loaders/Loader';
import styleApp from '../../style/style';

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedButton = new Animated.Value(1);
  }
  click() {
    this.props.click();
  }
  widthButton() {
    if (this.props.width) return this.props.width;
    return '90%';
  }
  styleButton() {
    if (!this.props.enable)
      return {...styles.buttonSubmit, backgroundColor: 'white'};
    else if (this.props.styleButton)
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
    if (!this.props.enable)
      return {
        ...styles.textButtonOn,
        color: colors[this.props.backgroundColor],
      };
    return styles.textButtonOn;
  }
  render() {
    return (
      <TouchableHighlight
        activeOpacity={1}
        disabled={!this.props.enable}
        underlayColor={this.onPressColor()}
        style={this.styleButton()}
        onPress={() => this.props.click()}>
        {this.props.loader ? (
          <Loader size={35} color={colors.white} />
        ) : (
          <Text style={this.styleText()}>{this.props.text}</Text>
        )}
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  buttonSubmit: {
    ...styleApp.center,
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 0,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#eaeaea',
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    shadowOpacity: 0,
  },
  textButtonOn: {
    ...styleApp.text,
    color: colors.white,
  },
});
