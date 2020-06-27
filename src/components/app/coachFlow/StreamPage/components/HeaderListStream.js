import React, {Component} from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';

import {createCoachSession, timeout} from '../../../../functions/coach';
import {logMixpanel} from '../../../../database/mixpanel';
import {coachAction} from '../../../../../actions/coachActions';

import colors from '../../../../style/colors';
import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';

class HeaderListStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  async newSession() {
    const {userID, infoUser, coachAction} = this.props;
    await this.setState({loader: true});

    const objectID = await createCoachSession({
      id: userID,
      info: infoUser,
    });
    await coachAction('setCurrentSessionID', objectID);
    logMixpanel('Create new session ' + objectID, {
      userID,
      objectID,
    });

    await database()
      .ref(`users/${userID}/coachSessions/${objectID}`)
      .set({
        id: objectID,
        timestamp: Date.now(),
      });

    this.setState({loader: false});
  }
  header = () => {
    const {hideButtonNewSession, AnimatedHeaderValue} = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={'Sessions'}
        inputRange={[5, 10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        loader={loader}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon2={!hideButtonNewSession && 'plus'}
        sizeIcon2={20}
        colorIcon2={colors.green}
        typeIcon2="font"
        clickButton2={() => this.props.navigation.goBack()}
      />
    );
  };

  render() {
    return this.header();
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(HeaderListStream);
