import React, {Component} from 'react';
import {View, Share} from 'react-native';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

export default class HeaderUserDirectory extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {branchLink, goBack, searchBar, AnimatedHeaderValue} = this.props;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        marginTop={10}
        textHeader={'Search for users'}
        inputRange={[40, 50]}
        searchBar={searchBar}
        searchBarStyle={{width: branchLink ? '62.5%' : '80%'}}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon2={branchLink && 'share'}
        sizeIcon2={20}
        typeIcon2={'moon'}
        colorIcon2={colors.title}
        clickButton2={async () => {
          const result = await Share.share({url: branchLink});
          if (result.action === Share.sharedAction) {
            goBack();
          }
        }}
        icon1={'times'}
        typeIcon1="font"
        sizeIcon1={20}
        colorIcon1={colors.title}
        clickButton1={() => goBack()}
      />
    );
  }
}
