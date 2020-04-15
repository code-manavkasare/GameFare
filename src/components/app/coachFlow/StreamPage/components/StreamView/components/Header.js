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
      displayCurrentUser: true,
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
    const {coachSession, userID, open} = this.props;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        inputRange={[5, 10]}
        colorLoader={'white'}
        colorIcon1={colors.white}
        sizeLoader={40}
        sizeIcon1={22}
        nobackgroundColorIcon1={true}
        backgroundColorIcon1={'transparent'}
        backgroundColorIcon2={'transparent'}
        initialBorderColorIcon={'transparent'}
        icon1={'chevron-down'}
        typeIcon1="font"
        icon2={
          !coachSession
            ? null
            : isUserAdmin(coachSession, userID)
            ? 'person-add'
            : null
        }
        initialTitleOpacity={1}
        clickButton1={async () => {
          open(false);
        }}
        clickButton2={() => this.AddMembers(coachSession.objectID)}
        sizeIcon2={27}
        typeIcon2="mat"
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
