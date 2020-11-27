import React from 'react';
import {connect} from 'react-redux';

import colors from '../../style/colors';

import {sessionOpening} from '../../functions/coach';
import {navigate} from '../../../../NavigationService';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import {
  titleSession,
  imageCardTeam,
  viewLive,
  hangupButton,
} from '../TeamPage/components/elements';
import {isSessionRequestSelector} from '../../../store/selectors/sessions';

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
      isSessionRequest,
    } = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={titleSession(session, 'small')}
        imgHeader={imageCardTeam(session, 60, true)}
        clickImgHeader={() =>
          navigate('SessionSettings', {objectID: session.objectID})
        }
        loader={loader || propsLoader}
        inputRange={[50, 80]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        typeIcon2={'moon'}
        initialBorderWidth={1}
        initialBorderColorHeader={colors.white}
        sizeIcon2={26}
        sizeIcon1={21}
        initialTitleOpacity={1}
        icon1={'chevron-left'}
        icon2={!isSessionRequest && 'film'}
        clickButton1={() => navigation.goBack()}
        clickButton2={() => this.openSession()}
        badgeIcon2={viewLive(session, {height: 20, width: 20}, true)}
        // iconOffset="custom"
        customOffset={hangupButton(session)}
      />
    );
  }
  render() {
    return this.header();
  }
}

const mapStateToProps = (state, props) => {
  const {objectID} = props.session;
  return {
    isSessionRequest: isSessionRequestSelector(state, {id: objectID}),
  };
};

export default connect(mapStateToProps)(HeaderConversation);
