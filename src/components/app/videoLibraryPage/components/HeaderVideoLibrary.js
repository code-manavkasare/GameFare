import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, Text, Image} from 'react-native';
import {connect} from 'react-redux';

import {navigate} from '../../../../../NavigationService';
import {addVideoToMember} from '../../../database/firebase/videosManagement.js';
import {addvideo} from '../../../functions/videoManagement';

import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

class HeaderVideoLibrary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  addVideo() {
    addvideo();
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
        return navigate('VideoLibrary');
      },
    });
  };

  render() {
    const {
      selectableMode,
      setState,
      loader,
      uploadVideo,
      isListEmpty,
      AnimatedHeaderValue,
      deleteVideos,
    } = this.props;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={selectableMode ? 'Select Videos' : ''}
        inputRange={[5, 10]}
        loader={loader}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon1={selectableMode ? 'times' : 'plus'}
        // colorIcon2={colors.white}
        icon2={isListEmpty ? null : selectableMode ? 'trash-alt' : 'text'}
        text2={'Select'}
        typeIcon2={'font'}
        sizeIcon2={17}
        sizeIcon1={22}
        clickButton2={() =>
          selectableMode ? deleteVideos() : setState({selectableMode: true})
        }
        clickButton1={() =>
          selectableMode ? setState({selectableMode: false}) : uploadVideo()
        }
        iconOffset={selectableMode && 'user-plus'}
        typeIconOffset="font"
        sizeIconOffset={16}
        colorIconOffset={colors.title}
        clickButtonOffset={() => this.pickMembersToShareVideosWith()}
        icon11={null}
        typeIcon11="font"
        sizeIcon11={23}
        colorIcon11={colors.title}
        clickButton11={() => navigate('LocalVideoLibrary')}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    videoLibrary: state.localVideoLibrary.videoLibrary,
  };
};

export default connect(mapStateToProps)(HeaderVideoLibrary);