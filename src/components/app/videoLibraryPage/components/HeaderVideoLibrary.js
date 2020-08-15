import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, Text, Image} from 'react-native';

import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import UploadHeader from './UploadHeader';

export default class HeaderVideoLibrary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
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
      AnimatedHeaderValue,
      selectOnly,
      navigation,
    } = this.props;
    return (
    <View style={{zIndex:11}}>
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={selectableMode ? 'Select Videos' : ''}
        inputRange={[20, 25]}
        loader={loader}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon1={selectOnly ? 'arrow-left' : selectableMode ? 'times' : 'plus'}
        sizeIcon1={17}
        clickButton1={() =>
          selectOnly
            ? navigation.goBack()
            : selectableMode
            ? toggleSelect()
            : add()
        }
        icon2={
          isListEmpty || selectOnly
            ? null
            : selectableMode
            ? 'trash-alt'
            : 'text'
        }
        text2={'Select'}
        typeIcon2={'font'}
        sizeIcon2={17}
        clickButton2={() => (!selectableMode ? toggleSelect() : remove())}
        iconOffset={selectableMode && !selectOnly && 'user-plus'}
        typeIconOffset="font"
        sizeIconOffset={16}
        colorIconOffset={colors.title}
        clickButtonOffset={() => share()}
      />
      <UploadHeader />
    </View>
    );
  }
}
