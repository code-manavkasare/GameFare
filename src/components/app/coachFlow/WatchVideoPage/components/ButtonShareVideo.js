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
import firebase from 'react-native-firebase';
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
        paused: stateVideo.paused,
        archiveID: archiveID,
        id: archiveID,
        thumbnail: stateVideo.placeHolderImg,
      };
      await firebase
        .database()
        .ref('coachSessions/' + objectID + '/sharedVideos/' + archiveID)
        .update(video);
      await firebase
        .database()
        .ref('coachSessions/' + objectID + '/members/' + userID)
        .update({shareScreen: true, videoIDSharing: archiveID});
    } else {
      await firebase
        .database()
        .ref('coachSessions/' + objectID + '/members/' + userID)
        .update({shareScreen: false});
    }
  }
  buttonStart() {
    return (
      <Button
        backgroundColor="green"
        onPressColor={colors.greenLight}
        styleButton={styles.button}
        enabled={true}
        text="Share this video"
        loader={false}
        click={() => this.startSharingVideo(true)}
      />
    );
  }
  buttonStop() {
    return (
      <Button
        backgroundColor="red"
        onPressColor={colors.redLight}
        styleButton={styles.button}
        enabled={true}
        text="Stop sharing"
        loader={false}
        click={() => this.startSharingVideo(false)}
      />
    );
  }
  button() {
    const {userID, personSharingScreen, session, archiveID} = this.props;
    const member = getMember(session, userID);
    if (!personSharingScreen) return this.buttonStart();
    if (personSharingScreen !== userID) return null;

    if (member.videoIDSharing === archiveID) return this.buttonStop();
    return this.buttonStart();
  }

  render() {
    return this.button();
  }
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 120,
    width: width - 40,
    marginLeft: 20,
    backgroundColor: 'red',
    zIndex: 5,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(ButtonShareVideo);
