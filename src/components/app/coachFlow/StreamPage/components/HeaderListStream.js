import React, {Component} from 'react';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';

import {navigate} from '../../../../../../NavigationService';

import {openSession} from '../../../../functions/coach';
import {logMixpanel} from '../../../../database/mixpanel';
import {coachAction} from '../../../../../actions/coachActions';
import {layoutAction} from '../../../../../actions/layoutActions';

import colors from '../../../../style/colors';
import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';

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
  componentDidMount() {
    this.props.onRef(this);
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
        console.log('members', members);
        const {userID, infoUser} = this.props;
        const session = await openSession(
          {
            id: userID,
            info: infoUser,
          },
          members,
        );
        StatusBar.setBarStyle('light-content', true);
        await navigate('StreamPage');
        return this.openSession(session);
      },
    });
  }
  async openSession(session) {
    const {layoutAction, coachAction} = this.props;
    await coachAction('setCurrentSession', false);
    await coachAction('setCurrentSession', session);
    await layoutAction('setLayout', {isFooterVisible: false});
    navigate('Session', {
      screen: 'Session',
      params: {},
    });
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
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon1={'hat-wizard'}
        typeIcon1="font"
        sizeIcon1={20}
        colorIcon1={colors.title}
        clickButton1={() => navigate('Coaches')}
        icon2={!hideButtonNewSession && 'plus'}
        sizeIcon2={23}
        colorIcon2={colors.title}
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
