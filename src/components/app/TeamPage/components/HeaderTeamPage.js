import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, Text, Image} from 'react-native';
import {connect} from 'react-redux';

import {navigate} from '../../../../../NavigationService';
import {shareCloudVideo} from '../../../database/firebase/videosManagement.js';
import {sessionOpening} from '../../../functions/coach';

import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createDiscussion, searchDiscussion} from '../../../functions/message';

class HeaderTeamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {loader, AnimatedHeaderValue, navigation, session} = this.props;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={''}
        inputRange={[5, 10]}
        loader={loader}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon1={'chevron-left'}
        icon2={'speech'}
        typeIcon2={'moon'}
        sizeIcon2={21}
        sizeIcon1={17}
        clickButton2={async () =>
          navigate('Conversation', {
            coachSessionID: session.objectID,
          })
        }
        clickButton1={() => navigation.goBack()}
        iconOffset={'film'}
        typeIconOffset="moon"
        sizeIconOffset={25}
        colorIconOffset={colors.title}
        clickButtonOffset={() => sessionOpening(session)}
        icon11={null}
        typeIcon11="font"
        sizeIcon11={23}
        colorIcon11={colors.title}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(HeaderTeamPage);
