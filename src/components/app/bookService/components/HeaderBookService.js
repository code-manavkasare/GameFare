import React, {Component} from 'react';
import {Share} from 'react-native';
import {createInviteToClubBranchUrl} from '../../../database/branch';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import colors from '../../../style/colors';

export default class HeaderClubSettings extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      branchLink: null,
      loader: false,
    };
  }
  share = async () => {
    let {branchLink} = this.state;
    const {clubID} = this.props;
    if (!branchLink) branchLink = await createInviteToClubBranchUrl(clubID);
    Share.share({url: branchLink});
  };
  render() {
    const {loader} = this.state;
    const {navigation, title, AnimatedHeaderValue} = this.props;
    return (
      <HeaderBackButton
        marginTop={10}
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={title}
        inputRange={[10, 20]}
        initialBorderColorIcon={'transparent'}
        initialBackgroundColor={'transparent'}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        initialBorderColorHeader={'transparent'}
        icon1={'times'}
        icon2={'share'}
        typeIcon2="moon"
        sizeIcon2={21}
        clickButton1={navigation.goBack}
        loader={loader}
        colorLoader={colors.title}
        clickButton2={this.share}
      />
    );
  }
}
