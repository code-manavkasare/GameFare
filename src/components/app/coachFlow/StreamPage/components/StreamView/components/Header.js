import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import NavigationService from '../../../../../../../../NavigationService';
import {layoutAction} from '../../../../../../../actions/layoutActions';

import HeaderBackButton from '../../../../../../layout/headers/HeaderBackButton';
import colors from '../../../../../../style/colors';
import {isUserAdmin} from '../../../../../../functions/coach';

class HeaderStreamView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  AddMembers = (objectID) => {
    const {navigate} = NavigationService;
    // const {currentMembers: members} = this.props;
    navigate('PickMembers', {
      usersSelected: {},
      selectMultiple: true,
      closeButton: true,
      loaderOnSubmit: true,
      contactsOnly: false,
      displayCurrentUser: false,
      titleHeader: 'Add someone to the session',
      onGoBack: async (members) => {
        for (var i in Object.values(members)) {
          let member = Object.values(members)[i];
          // member.isConnected = false;
          member.invitationTimeStamp = Date.now();
          await database()
            .ref('coachSessions/' + objectID + '/members/' + member.id)
            .update(member);
        }
        return navigate('Stream');
      },
    });
  };
  header() {
    const {
      coachSessionID,
      organizerID,
      userID,
      setState,
      state,
      permissionOtherUserToRecord,
    } = this.props;
    const {isConnected} = state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        inputRange={[5, 10]}
        colorLoader={'white'}
        sizeLoader={40}
        initialBorderColorIcon={'transparent'}
        icon1={'arrow-left'}
        typeIcon1="font"
        backgroundColorIcon1={colors.title + '70'}
        clickButton1={() => {
          const {layoutAction} = this.props;
          layoutAction('setLayout', {isFooterVisible: true});
          NavigationService.navigate('Stream');
        }}
        nobackgroundColorIcon1={true}
        sizeIcon1={18}
        colorIcon1={colors.white}
        icon2={isConnected && 'switchCam'}
        backgroundColorIcon2={colors.title + '70'}
        clickButton2={() => setState({cameraFront: !state.cameraFront})}
        sizeIcon2={20}
        typeIcon2="moon"
        colorIcon2={colors.white}
        iconOffset={isConnected && 'cog'}
        typeIconOffset="font"
        sizeIconOffset={18}
        backgroundColorIconOffset={colors.title + '70'}
        iconOffset2={
          isConnected && isUserAdmin(organizerID, userID) && 'person-add'
        }
        typeIconOffset2="mat"
        sizeIconOffset2={23}
        clickButtonOffset2={() => this.AddMembers(coachSessionID)}
        backgroundColorIconOffset2={colors.title + '70'}
        initialTitleOpacity={1}
        clickButtonOffset={() =>
          NavigationService.navigate('Settings', {
            coachSessionID: coachSessionID,
            permissionOtherUserToRecord: permissionOtherUserToRecord,
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
  };
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(HeaderStreamView);
