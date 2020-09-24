import React, {Component} from 'react';
import {View, Share, Animated} from 'react-native';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

export default class HeaderUserDirectory extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  render() {
    const {branchLink, goBack} = this.props;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={'Search for users'}
        inputRange={[40, 50]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon2={branchLink && 'link'}
        sizeIcon2={23}
        colorIcon2={colors.title}
        clickButton2={async () => {
          const result = await Share.share({url: branchLink});
          if (result.action === Share.sharedAction) {
            goBack();
          }
        }}
        icon1={'times'}
        sizeIcon1={23}
        colorIcon1={colors.title}
        clickButton1={() => goBack()}
      />
    );
  }
}
