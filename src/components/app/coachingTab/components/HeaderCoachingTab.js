import React, {Component} from 'react';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';

import {navigate} from '../../../../../NavigationService';

import {createCoachSession, timeout} from '../../../functions/coach';
import {logMixpanel} from '../../../database/mixpanel';
import {coachAction} from '../../../../actions/coachActions';
import {layoutAction} from '../../../../actions/layoutActions';

import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import Mixpanel from 'react-native-mixpanel';
import {mixPanelToken} from '../../../database/firebase/tokens';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

class HeaderListStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  newSession() {
    navigate('PickMembers', {
      usersSelected: {},
      selectMultiple: true,
      closeButton: true,
      loaderOnSubmit: true,
      contactsOnly: false,
      displayCurrentUser: false,
      noUpdateStatusBar: true,
      titleHeader: 'Select members',
      text2: 'Skip',
      icon2: 'text',
      clickButton2: async () => {
        const session = await this.createSession({});
        StatusBar.setBarStyle('light-content', true);
        await navigate('StreamPage');
        return this.openSession(session);
      },
      onGoBack: async (members) => {
        members = Object.values(members).reduce(function(result, item) {
          result[item.id] = {
            id: item.id,
            info: item.info,
          };
          return result;
        }, {});

        const session = await this.createSession(members);
        StatusBar.setBarStyle('light-content', true);
        await navigate('StreamPage');
        return this.openSession(session);
      },
    });
  }
  async openSession(session) {
    const {layoutAction, coachAction} = this.props;
    await coachAction('unsetCurrentSession');
    await coachAction('setCurrentSession', session);
    await layoutAction('setLayout', {isFooterVisible: false});
    navigate('Session', {
      screen: 'Session',
      params: {},
    });
  }
  async createSession(members) {
    const {userID, infoUser} = this.props;
    const session = await createCoachSession(
      {
        id: userID,
        info: infoUser,
      },
      members,
    );
    const {objectID} = session;
    logMixpanel('Create new session ' + objectID, {
      userID,
      objectID,
    });

    return session;
  }
  header = () => {
    const {hideButtonNewSession, AnimatedHeaderValue} = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={''}
        inputRange={[5, 10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        loader={loader}
        icon1="times"
        clickButton1={() => navigate('StreamPage')}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon2={!hideButtonNewSession && 'plus'}
        sizeIcon2={27}
        colorIcon2={colors.green}
        typeIcon2="font"
        clickButton2={() => this.newSession()}
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
  {coachAction, layoutAction},
)(HeaderListStream);
