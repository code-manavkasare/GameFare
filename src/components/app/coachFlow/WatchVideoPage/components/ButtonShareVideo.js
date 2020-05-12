import React, {Component} from 'react';
import {} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import Button from '../../../../layout/buttons/Button';
import {coachAction} from '../../../../../actions/coachActions';

import colors from '../../../../style/colors';
import {
  marginTopApp,
  heightHeaderHome,
  marginTopAppLanscape,
} from '../../../../style/sizes';

class ButtonShareVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.props.onRef(this);
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
        playRate: 1,
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
  buttonStart() {
    const {portrait} = this.props;
    let marginTop = marginTopApp + heightHeaderHome;
    if (!portrait) marginTop = marginTopAppLanscape + heightHeaderHome;
    const style = {
      position: 'absolute',
      zIndex: 600,
      height: 30,
      width: 110,
      left: '5%',
      borderRadius: 15,
      top: marginTop,
    };
    return (
      <Button
        backgroundColor="green"
        onPressColor={colors.greenLight}
        styleButton={style}
        enabled={true}
        text="Share video"
        loader={false}
        textButton={{fontSize: 13}}
        click={() => this.startSharingVideo(true)}
      />
    );
  }
  buttonStop() {
    const {portrait} = this.props;
    let marginTop = marginTopApp + heightHeaderHome;
    if (!portrait) marginTop = marginTopAppLanscape + heightHeaderHome;
    const style = {
      position: 'absolute',
      zIndex: 600,
      height: 30,
      width: 80,
      left: '5%',
      borderRadius: 15,
      top: marginTop,
    };
    return (
      <Button
        backgroundColor="red"
        onPressColor={colors.redLight}
        styleButton={style}
        enabled={true}
        textButton={{fontSize: 13}}
        text="Sharing..."
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
      videoBeingShared,
    } = this.props;

    if (!personSharingScreen) return this.buttonStart();
    if (personSharingScreen !== userID) return null;
    if (videoBeingShared.id === archiveID) return this.buttonStop();

    return this.buttonStart();
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
