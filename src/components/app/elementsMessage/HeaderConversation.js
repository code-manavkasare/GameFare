import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {connect} from 'react-redux';

import colors from '../../style/colors';

import {openSession, sessionOpening} from '../../functions/coach';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import {titleSession, imageCardTeam} from '../TeamPage/components/elements';

class HeaderConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  async openSession() {
    const {session} = this.props;
    sessionOpening(session);
  }
  header() {
    const {
      session,
      navigation,
      AnimatedHeaderValue,
      loader: propsLoader,
    } = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={titleSession(session, 'small')}
        imgHeader={imageCardTeam(session, 60, true)}
        loader={loader || propsLoader}
        inputRange={[50, 80]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        typeIcon2={'moon'}
        initialBorderWidth={1}
        initialBorderColorHeader={colors.white}
        sizeIcon2={26}
        initialTitleOpacity={1}
        icon1={'arrow-left'}
        icon2={'film'}
        clickButton1={() => navigation.goBack()}
        clickButton2={() => this.openSession()}
      />
    );
  }
  render() {
    return this.header();
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderConversation);
