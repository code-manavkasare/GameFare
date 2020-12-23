import React, {Component} from 'react';
import {Share} from 'react-native';
import {goBack, navigate} from '../../../../../NavigationService';
import {createInviteToClubBranchUrl} from '../../../database/branch';
import {removeUserFromClub} from '../../../functions/clubs';
import {timeout} from '../../../functions/coach';

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
  editClub = async () => {
    const {clubID} = this.props;
    goBack();
    await timeout(300);
    navigate('EditClub', {editClubID: clubID});
  };
  share = async () => {
    let {branchLink} = this.state;
    const {clubID} = this.props;
    if (!branchLink) branchLink = await createInviteToClubBranchUrl(clubID);
    Share.share({url: branchLink});
  };
  leaveClub = async () => {
    const {clubID} = this.props;
    goBack();
    await timeout(300);
    navigate('Alert', {
      title: 'Are you sure you want to leave this club?',
      textButton: 'Leave',
      colorButton: 'red',
      onPressColor: colors.red,
      onGoBack: async () => {
        await removeUserFromClub({clubID});
      },
      nextNavigation: async () => {
        await timeout(300);
        navigate('ClubsPage', {clubID: undefined, timestamp: Date.now()});
      },
    });
  };
  showOptions = async () => {
    const {isClubOwner} = this.props;
    const listOptions = isClubOwner
      ? [
          {
            title: 'Edit club details',
            icon: {
              type: 'font',
              name: 'edit',
              size: 19,
              color: colors.white,
              solid: true,
            },
            operation: this.editClub,
            forceNavigation: true,
          },
          {
            title: 'Share invite link',
            icon: {
              type: 'font',
              name: 'link',
              size: 19,
              color: colors.white,
            },
            operation: this.share,
            color: colors.green,
          },
        ]
      : [
          {
            title: 'Leave club',
            operation: this.leaveClub,
            color: colors.red,
            forceNavigation: true,
          },
        ];
    navigate('Alert', {
      title: 'Club Options',
      displayList: true,
      forceVertical: true,
      listOptions,
    });
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
        initialTitleOpacity={0}
        initialBorderWidth={1}
        initialBorderColorHeader={'transparent'}
        icon2={'times'}
        typeIcon2={'font'}
        iconOffset={'ellipsis-h'}
        typeIconOffset="font"
        sizeIconOffset={16}
        clickButton2={navigation.goBack}
        loader={loader}
        colorLoader={colors.title}
        clickButtonOffset={this.showOptions}
      />
    );
  }
}
