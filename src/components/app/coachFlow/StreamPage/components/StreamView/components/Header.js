import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import NavigationService from '../../../../../../../../NavigationService';
import {layoutAction} from '../../../../../../../actions/layoutActions';

import HeaderBackButton from '../../../../../../layout/headers/HeaderBackButton';
import colors from '../../../../../../style/colors';
import {
  isUserAdmin,
  addMembersToSession,
} from '../../../../../../functions/coach';

class HeaderStreamView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  header() {
    const {
      coachSessionID,
      organizerID,
      userID,
      setState,
      state,
      permissionOtherUserToRecord,
      close,
      chargeForSession,
      currentSessionReconnecting,
      isConnected,
    } = this.props;

    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        inputRange={[5, 10]}
        colorLoader={'white'}
        sizeLoader={40}
        initialBorderColorIcon={'transparent'}
        icon1={'arrow-left'}
        typeIcon1="font"
        backgroundColorIcon1={colors.title + '50'}
        onPressColorIcon1={colors.title + '30'}
        clickButton1={() => close()}
        nobackgroundColorIcon1={true}
        sizeIcon1={16}
        colorIcon1={colors.white}
        icon2={isConnected && 'switchCam'}
        backgroundColorIcon2={colors.title + '70'}
        clickButton2={() => setState({cameraFront: !state.cameraFront})}
        sizeIcon2={17}
        typeIcon2="moon"
        colorIcon2={colors.white}
        iconOffset={isConnected && 'cog'}
        typeIconOffset="font"
        sizeIconOffset={18}
        colorIconOffset={
          currentSessionReconnecting ? colors.greyDark : colors.white
        }
        backgroundColorIconOffset={colors.title + '70'}
        iconOffset2={
          isConnected && isUserAdmin(organizerID, userID) && 'person-add'
        }
    
        typeIconOffset2="mat"
        sizeIconOffset2={23}
        colorIconOffset2={
          currentSessionReconnecting ? colors.greyDark : colors.white
        }
        clickButtonOffset2={() =>
          currentSessionReconnecting
            ? null
            : addMembersToSession(coachSessionID, 'Session')
        }
        backgroundColorIconOffset2={colors.title + '70'}
        initialTitleOpacity={1}
        clickButtonOffset={() =>
          currentSessionReconnecting
            ? null
            : NavigationService.navigate('Settings', {
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
