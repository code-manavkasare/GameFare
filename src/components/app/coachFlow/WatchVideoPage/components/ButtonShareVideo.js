import React, {Component} from 'react';
import {} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import Button from '../../../../layout/buttons/Button';
import {coachAction} from '../../../../../actions/coachActions';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

class ButtonShareVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async startSharingVideo(value) {
    const {
      userID,
      coachSessionID,
      coachAction,
      archiveID,
      getVideoState,
      source,
      togglePlayPause,
      open,
    } = this.props;
    const stateVideo = getVideoState();

    if (value) {
      await coachAction('setCoachSessionDrawSettings', {
        touchEnabled: false,
      });

      const video = {
        source: source,
        currentTime: stateVideo.currentTime,
        paused: true,
        archiveID: archiveID,
        id: archiveID,
        thumbnail: stateVideo.placeHolderImg,
      };

      let updates = {};
      updates[
        `coachSessions/${coachSessionID}/sharedVideos/${archiveID}`
      ] = video;
      updates[
        `coachSessions/${coachSessionID}/members/${userID}/shareScreen`
      ] = true;
      updates[
        `coachSessions/${coachSessionID}/members/${userID}/videoIDSharing`
      ] = archiveID;
      await togglePlayPause(true);
      await database()
        .ref()
        .update(updates);
    } else {
      await database()
        .ref()
        .update({
          [`coachSessions/${coachSessionID}/members/${userID}/shareScreen`]: false,
        });
      open(false);
    }
  }
  buttonStart(styleButton) {
    return (
      <Button
        backgroundColor="green"
        onPressColor={colors.greenLight}
        styleButton={styleButton}
        enabled={true}
        text="Share this video"
        loader={false}
        click={() => this.startSharingVideo(true)}
      />
    );
  }
  buttonStop(styleButton) {
    return (
      <Button
        backgroundColor="red"
        onPressColor={colors.redLight}
        styleButton={styleButton}
        enabled={true}
        text="Stop sharing"
        loader={false}
        click={() => this.startSharingVideo(false)}
      />
    );
  }
  button() {
    const {
      userID,
      personSharingScreen,
      archiveID,
      portrait,
      videoBeingShared,
    } = this.props;
    let styleButton = {
      position: 'absolute',
      bottom: 120,
      width: '90%',
      marginLeft: '5%',
      zIndex: 5,
    };
    if (!portrait)
      styleButton = {
        position: 'absolute',
        bottom: 120,
        width: 170,
        marginLeft: '5%',
        zIndex: 5,
      };
    if (!personSharingScreen) return this.buttonStart(styleButton);
    if (personSharingScreen !== userID) return null;

    if (videoBeingShared.id === archiveID) return this.buttonStop(styleButton);
    // return null;
    return this.buttonStart(styleButton);
  }

  render() {
    return this.button();
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    portrait: state.layout.currentScreenSize.portrait,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(ButtonShareVideo);
