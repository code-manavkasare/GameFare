import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, Text, Image} from 'react-native';

import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

export default class HeaderVideoLibrary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  render() {
    const {
      loader,
      isListEmpty,
      selectableMode,
      toggleSelect,
      add,
      remove,
      share,
    } = this.props;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={selectableMode ? 'Select Videos' : ''}
        inputRange={[5, 10]}
        loader={loader}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon1={selectableMode ? 'times' : 'plus'}
        sizeIcon1={22}
        clickButton1={() => selectableMode ? toggleSelect() : add()}
        icon2={isListEmpty ? null : selectableMode ? 'trash-alt' : 'text'}
        text2={'Select'}
        typeIcon2={'font'}
        sizeIcon2={17}
        clickButton2={() => !selectableMode ? toggleSelect() : remove()}
        iconOffset={selectableMode && 'user-plus'}
        typeIconOffset="font"
        sizeIconOffset={16}
        colorIconOffset={colors.title}
        clickButtonOffset={() => share()}
      />
    );
  }
}
