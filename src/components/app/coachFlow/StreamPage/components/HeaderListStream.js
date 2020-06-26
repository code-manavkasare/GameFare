import React, {Component} from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';

import {createCoachSession, timeout} from '../../../../functions/coach';
import {coachAction} from '../../../../../actions/coachActions';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {width, heightHeaderStream, marginTopApp} from '../../../../style/sizes';
import ButtonColor from '../../../../layout/Views/Button';
import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';
import Loader from '../../../../layout/loaders/Loader';
import AllIcons from '../../../../layout/icons/AllIcons';

import Mixpanel from 'react-native-mixpanel';
import {mixPanelToken} from '../../../../database/firebase/tokens';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

class HeaderListStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  async newSession() {
    const {navigation, userConnected} = this.props;
    if (!userConnected) return navigation.navigate('SignIn');
    const {userID, infoUser, coachAction, sessionInfo} = this.props;
    const {objectID: prevObjectID} = sessionInfo;
    await this.setState({loader: true});

    const objectID = await createCoachSession({
      id: userID,
      info: infoUser,
    });
    await coachAction('setSessionInfo', {
      objectID: objectID,
      autoOpen: true,
      // prevObjectID: 'teub',
    });
    Mixpanel.trackWithProperties('Create new session ' + objectID, {
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
        textHeader={'Your sessions'}
        inputRange={[5, 10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
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

const styles = StyleSheet.create({
  header: {
    marginTop: marginTopApp,
    height: heightHeaderStream,
    borderBottomWidth: 1,
    borderColor: colors.off,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  buttonNewSession: {
    ...styleApp.center,
    borderRadius: 22.5,
    height: 45,
    width: 45,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginTop: 20,
    width: width,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    sessionInfo: state.coach.sessionInfo,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(HeaderListStream);
