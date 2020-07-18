import React, {Component} from 'react';
import {connect} from 'react-redux';
import {navigate} from '../../../../../../NavigationService';

import {openSession, sessionOpening} from '../../../../functions/coach';
import colors from '../../../../style/colors';
import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';

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
      clickButton2: () => {
        return this.createSession({});
      },
      onGoBack: (members) => this.createSession(members),
    });
  }
  async createSession(members) {
    members = Object.values(members).reduce(function(result, item) {
      result[item.id] = {
        id: item.id,
        info: item.info,
      };
      return result;
    }, {});
    const {userID, infoUser} = this.props;
    const session = await openSession(
      {
        id: userID,
        info: infoUser,
      },
      members,
    );
    return sessionOpening(session);
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
        icon1={'whistle'}
        typeIcon1="moon"
        sizeIcon1={30}
        colorIcon1={colors.title}
        clickButton1={() => navigate('Coaches')}
        iconOffset={'bell'}
        typeIconOffset="font"
        sizeIconOffset={23}
        colorIconOffset={colors.title}
        clickButtonOffset={() => navigate('NotificationPage')}
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
  {},
)(HeaderListStream);
