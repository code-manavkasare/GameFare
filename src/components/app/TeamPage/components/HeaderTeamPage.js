import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, Text, Image} from 'react-native';
import {connect} from 'react-redux';

import {navigate} from '../../../../../NavigationService';
import {addVideoToMember} from '../../../database/firebase/videosManagement.js';
import {sessionOpening} from '../../../functions/coach';
import {addvideo} from '../../../functions/videoManagement';

import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createDiscussion, searchDiscussion} from '../../../functions/message';

class HeaderGroupPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaderMessage: false,
    };
  }

  pickMembersToShareVideosWith = () => {
    const {userID, selectedVideos, setState} = this.props;

    navigate('PickMembers', {
      usersSelected: {},
      selectMultiple: true,
      closeButton: true,
      loaderOnSubmit: true,
      contactsOnly: false,
      displayCurrentUser: false,
      noUpdateStatusBar: true,
      titleHeader: 'Select members to share video with',
      onGoBack: async (members) => {
        for (const member of Object.values(members)) {
          for (const videoId of selectedVideos) {
            addVideoToMember(userID, member.id, videoId);
          }
        }
        setState({selectableMode: false, selectedVideos: []});
        return navigate('VideoLibraryPage');
      },
    });
  };

  render() {
    const {loaderMessage} = this.state;
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
        loader={loaderMessage}
        initialBorderWidth={1}
        icon1={'arrow-left'}
        icon2={'speech'}
        typeIcon2={'moon'}
        sizeIcon2={21}
        sizeIcon1={17}
        clickButton2={async () => {
          await this.setState({loaderMessage: true});
          // navigate('Conversation', {data: '-MCqk2hmqED4Q3ErEs1L'})
          await navigate('Alert', {
            title: 'Work in progress',
            textButton: 'Ok',
            close: true,
          });
          await this.setState({loaderMessage: false});
        }}
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
        clickButton11={async () =>
          navigate('Conversation', {data: '-MCqk2hmqED4Q3ErEs1L'})
        }
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(HeaderGroupPage);
