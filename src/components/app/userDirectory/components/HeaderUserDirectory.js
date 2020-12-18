import React, {Component} from 'react';
import {View, Share} from 'react-native';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createInviteToSessionBranchUrl} from '../../../database/branch';

export default class HeaderUserDirectory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      branchLink: props.branchLink,
    };
  }
  async shareNewSession() {
    await this.setState({loader: true});
    const branchLink = await createInviteToSessionBranchUrl();
    await this.setState({loader: false, branchLink});
    this.shareLink(branchLink);
  }
  async shareLink(branchLink) {
    await Share.share({url: branchLink});
  }
  render() {
    const {loader, branchLink} = this.state;
    const {goBack, searchBar, AnimatedHeaderValue} = this.props;

    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        marginTop={10}
        textHeader={'Search for users'}
        inputRange={[40, 50]}
        searchBar={searchBar}
        loader={loader}
        searchBarStyle={{width: '62.5%'}}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        colorLoader={colors.title}
        icon2={'share'}
        sizeIcon2={17}
        typeIcon2={'moon'}
        colorIcon2={colors.title}
        clickButton2={() => {
          if (branchLink) return this.shareLink(branchLink);
          this.shareNewSession();
        }}
        icon1={'times'}
        typeIcon1="font"
        sizeIcon1={15}
        colorIcon1={colors.title}
        clickButton1={() => goBack()}
      />
    );
  }
}
