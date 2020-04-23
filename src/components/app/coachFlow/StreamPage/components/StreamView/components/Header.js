import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';

import NavigationService from '../../../../../../../../NavigationService';

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
    navigate('PickMembers', {
      usersSelected: {},
      selectMultiple: true,
      closeButton: true,
      loaderOnSubmit: true,
      displayCurrentUser: false,
      titleHeader: 'Add someone to the session',
      onGoBack: async (members) => {
        for (var i in Object.values(members)) {
          const member = Object.values(members)[i];
          await firebase
            .database()
            .ref('coachSessions/' + objectID + '/members/' + member.id)
            .update(member);
        }
        return navigate('Stream');
      },
    });
  };
  header() {
    const {
      coachSession,
      userID,
      open,
      setState,
      state,
      opacityHeader,
    } = this.props;
    const {isConnected} = state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        inputRange={[5, 10]}
        colorLoader={'white'}
        colorIcon1={colors.white}
        sizeLoader={40}
        sizeIcon1={18}
        opacityHeader={opacityHeader}
        nobackgroundColorIcon1={true}
        backgroundColorIcon1={colors.greyDark + '70'}
        backgroundColorIcon2={colors.greyDark + '70'}
        backgroundColorIconOffset={colors.greyDark + '70'}
        initialBorderColorIcon={'transparent'}
        sizeIconOffset={23}
        icon1={'chevron-down'}
        icon2={isConnected && 'switchCam'}
        typeIconOffset="mat"
        clickButton2={() => setState({cameraFront: !state.cameraFront})}
        typeIcon1="font"
        iconOffset={
          !coachSession
            ? null
            : isConnected && isUserAdmin(coachSession, userID)
            ? 'person-add'
            : null
        }
        initialTitleOpacity={1}
        clickButton1={async () => {
          open(false);
        }}
        clickButtonOffset={() => this.AddMembers(coachSession.objectID)}
        sizeIcon2={20}
        typeIcon2="moon"
        colorIcon2={colors.white}
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
  {},
)(HeaderStreamView);
