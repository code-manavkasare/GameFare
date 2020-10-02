import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {layoutAction} from '../../../../../../../actions/layoutActions';

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
        inputRange={[5, 10]}
        colorLoader={'white'}
        sizeLoader={40}
        initialBorderColorIcon={'transparent'}
        // icon1={'arrow-left'}
        typeIcon1="font"
        backgroundColorIcon1={colors.title + '50'}
        onPressColorIcon1={colors.title + '30'}
        clickButton1={() => true}
        nobackgroundColorIcon1={true}
        sizeIcon1={16}
        colorIcon1={colors.white}
        icon2={isConnected && 'sync-alt'}
        backgroundColorIcon2={colors.title + '70'}
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
        backgroundColorIconOffset={colors.title + '70'}
        iconOffset2={isConnected && 'person-add'}
        typeIconOffset2="mat"
        sizeIconOffset2={23}
        colorIconOffset2={
          currentSessionReconnecting ? colors.greyDark : colors.white
        }
        clickButtonOffset2={async () =>
          currentSessionReconnecting
            ? null
            : navigation.navigate('UserDirectory', {
                action: 'invite',
                branchLink: await createInviteToSessionBranchUrl(
                  coachSessionID,
                ),
              })
        }
        backgroundColorIconOffset2={colors.title + '70'}
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

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentSessionReconnecting: state.coach.reconnecting,
  };
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(HeaderStreamView);
