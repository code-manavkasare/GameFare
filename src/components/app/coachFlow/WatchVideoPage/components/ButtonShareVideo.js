import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
const {height, width} = Dimensions.get('screen');

import Button from '../../../../layout/buttons/Button';
import {coachAction} from '../../../../../actions/coachActions';
import {getMember} from '../../../../functions/coach';

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
      session,
      coachAction,
      archiveID,
      getVideoState,
      source,
      togglePlayPause,
    } = this.props;
    const {objectID} = session;
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
      updates[`coachSessions/${objectID}/sharedVideos/${archiveID}`] = video;
      updates[`coachSessions/${objectID}/members/${userID}/shareScreen`] = true;
      updates[
        `coachSessions/${objectID}/members/${userID}/videoIDSharing`
      ] = archiveID;
      await togglePlayPause(true);
      await database()
        .ref()
        .update(updates);
      // await togglePlayPause(true);
    } else {
      await database()
        .ref()
        .update({
          [`coachSessions/${objectID}/members/${userID}/shareScreen`]: false,
        });
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
      session,
      archiveID,
      portrait,
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
    const member = getMember(session, userID);
    if (!personSharingScreen) return this.buttonStart(styleButton);
    if (personSharingScreen !== userID) return null;

    if (member.videoIDSharing === archiveID)
      return this.buttonStop(styleButton);
    // return null;
    return this.buttonStart(styleButton);
  }

  render() {
    return this.button();
  }
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 120,
    width: '90%',
    marginLeft: '5%',
    zIndex: 5,
  },
});

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
