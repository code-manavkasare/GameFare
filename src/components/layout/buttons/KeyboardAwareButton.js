import React, {Component} from 'react';
import {StyleSheet, View, InputAccessoryView, Animated} from 'react-native';
import {object, bool, func, string} from 'prop-types';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import Button from './Button';
import ButtonFull from './ButtonFull';

export default class KeyboardAwareButton extends Component {
  static propTypes = {
    loader: bool,
    disabled: bool,
    click: func,
    nativeID: string,
    text: string,
    icon: object,
    styleButton: object,
    onPressColor: string,
    backgroundColor: string,
  };
  static defaultProps = {
    onPressColor: 'primary',
    backgroundColor: colors.primaryLight,
  };
  constructor(props) {
    super(props);
    this.state = {
      backgroundColorAnimation: new Animated.Value(0),
      loading: false,
    };
  }

  render() {
    const {
      disabled,
      loader,
      click,
      styleFooter,
      text,
      styleButton,
      nativeID,
      backgroundColor,
      onPressColor,
    } = this.props;
    return (
      <View style={styleFooter}>
        <Button
          backgroundColor={backgroundColor}
          onPressColor={onPressColor}
          disabled={disabled}
          text={text}
          styleButton={styleButton}
          loader={loader}
          click={click}
        />
        <InputAccessoryView nativeID={nativeID}>
          <ButtonFull
            backgroundColor={backgroundColor}
            onPressColor={onPressColor}
            loader={loader}
            click={click}
            enable={!disabled}
            text={text}
          />
        </InputAccessoryView>
      </View>
    );
  }
}
