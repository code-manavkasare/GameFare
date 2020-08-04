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
      allowSelectMultiple: true,
      selectFromGamefare: true,
      closeButton: true,
      loaderOnSubmit: true,
      displayCurrentUser: false,
      noUpdateStatusBar: true,
      noNavigation: true,
      titleHeader: 'Select members',
      text2: 'Skip',
      icon2: 'text',
      clickButton2: () => this.createSession({}),
      onSelectMembers: (users, contacts) => this.createSession(users),
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
    console.log('session!', session);
    // return sessionOpening(session);
  }
  header = () => {
    const {hideButtonNewSession, AnimatedHeaderValue, infoUser} = this.props;

    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={'Teams'}
        inputRange={[5, 10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        loader={loader}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={0}
        initialBorderWidth={1}
        // icon1={'whistle'}
        // typeIcon1="moon"
        // sizeIcon1={30}
        // colorIcon1={colors.title}
        // clickButton1={() => navigate('Coaches')}
        // icon1={!hideButtonNewSession && 'plus'}
        // typeIcon1="font"
        // sizeIcon1={22}
        // colorIcon1={colors.title}
        // clickButton1={() => this.newSession()}
        icon2={'bell'}
        typeIcon2="font"
        sizeIcon2={24}
        colorIcon2={colors.title}
        clickButton2={() => navigate('NotificationPage')}
        icon1={infoUser.picture ? infoUser.picture : 'profileFooter'}
        sizeIcon1={infoUser.picture ? 31 : 23}
        colorIcon1={colors.title}
        typeIcon1={infoUser.picture ? 'image' : 'moon'}
        clickButton1={() => navigate('MorePage')}
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
