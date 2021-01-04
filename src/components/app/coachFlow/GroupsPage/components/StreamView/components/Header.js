import React, {Component} from 'react';
import {Animated} from 'react-native';
import {connect} from 'react-redux';
import {reconnectingSelector} from '../../../../../../../store/selectors/sessions';

import {createInviteToSessionBranchUrl} from '../../../../../../database/branch';

import HeaderBackButton from '../../../../../../layout/headers/HeaderBackButton';
import colors from '../../../../../../style/colors';

class HeaderStreamView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  header() {
    const {
      coachSessionID,
      setState,
      state,
      permissionOtherUserToRecord,
      chargeForSession,
      currentSessionReconnecting,
      isConnected,
      navigation,
    } = this.props;

    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        inputRange={[0, 100]}
        colorLoader={'white'}
        sizeLoader={40}
        initialBorderColorIcon={'transparent'}
        // icon1={'arrow-left'}
        typeIcon1="font"
        backgroundColorIcon1={'blur'}
        onPressColorIcon1={colors.title + '30'}
        clickButton1={() => true}
        nobackgroundColorIcon1={true}
        sizeIcon1={16}
        colorIcon1={colors.white}
        icon2={isConnected && 'sync-alt'}
        backgroundColorIcon2={'blur'}
        clickButton2={() => setState({cameraFront: !state.cameraFront})}
        sizeIcon2={17}
        typeIcon2="font"
        colorIcon2={colors.white}
        iconOffset={isConnected && 'cog'}
        typeIconOffset="font"
        sizeIconOffset={18}
        colorIconOffset={
          currentSessionReconnecting ? colors.greyDark : colors.white
        }
        backgroundColorIconOffset={'blur'}
        iconOffset2={isConnected && 'person-add'}
        typeIconOffset2="mat"
        sizeIconOffset2={23}
        colorIconOffset2={
          currentSessionReconnecting ? colors.greyDark : colors.white
        }
        clickButtonOffset2={async () =>
          currentSessionReconnecting
            ? null
            : navigation.navigate('SearchPage', {
                action: 'invite',
                branchLink: await createInviteToSessionBranchUrl(
                  coachSessionID,
                ),
              })
        }
        backgroundColorIconOffset2={'blur'}
        initialTitleOpacity={1}
        clickButtonOffset={() =>
          currentSessionReconnecting
            ? null
            : navigation.navigate('Settings', {
                coachSessionID: coachSessionID,
                permissionOtherUserToRecord: permissionOtherUserToRecord,
                chargeForSession: chargeForSession,
              })
        }
      />
    );
  }
  render() {
    return this.header();
  }
}

const mapStateToProps = (state) => {
  return {
    currentSessionReconnecting: reconnectingSelector(state),
  };
};

export default connect(mapStateToProps)(HeaderStreamView);
