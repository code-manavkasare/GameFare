import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import Button from '../../../layout/buttons/Button';
import {openVideoPlayer} from '../../../functions/videoManagement';
import {
  isSomeoneSharingScreen,
  isVideosAreBeingShared,
} from '../../../functions/coach';
import colors from '../../../style/colors';
import {
  marginTopApp,
  heightHeaderHome,
  marginTopAppLandscape,
} from '../../../style/sizes';

class ButtonShareVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async startSharingVideo(value) {
    const {
      userID,
      coachSessionID,
      archives,
      getVideoState,
      togglePlayPause,
      session,
    } = this.props;

    let updates = {};
    console.log('archives', archives);
    for (let i in archives) {
      const {id, local} = archives[i];
      console.log('{id, local}', {id, local});
      const stateVideo = getVideoState(i);
      console.log('stateVideo', stateVideo);

      if (value) {
        updates[
          `coachSessions/${coachSessionID}/sharedVideos/${id}/currentTime`
        ] = stateVideo.currentTime;
        updates[
          `coachSessions/${coachSessionID}/sharedVideos/${id}/paused`
        ] = true;
        updates[
          `coachSessions/${coachSessionID}/sharedVideos/${id}/playRate`
        ] = 1;
        updates[
          `coachSessions/${coachSessionID}/sharedVideos/${id}/position`
        ] = {x: 0, y: 0};
        updates[`coachSessions/${coachSessionID}/sharedVideos/${id}/scale`] = 1;

        updates[`coachSessions/${coachSessionID}/sharedVideos/${id}/id`] = id;

        updates[
          `coachSessions/${coachSessionID}/members/${userID}/shareScreen`
        ] = true;
        updates[
          `coachSessions/${coachSessionID}/members/${userID}/videoIDSharing`
        ] = id;
        // await togglePlayPause(true);
      } else {
        updates[
          `coachSessions/${coachSessionID}/members/${userID}/shareScreen`
        ] = false;
        updates[
          `coachSessions/${coachSessionID}/members/${userID}/sharedVideos`
        ] = null;
      }
    }
    console.log(
      'ou pa',
      Object.values(archives).reduce(function(result, item) {
        result[item.id] = true;
        return result;
      }, {}),
    );
    updates[
      `coachSessions/${coachSessionID}/members/${userID}/sharedVideos`
    ] = Object.values(archives).reduce(function(result, item) {
      result[item.id] = true;
      return result;
    }, {});
    console.log('bim updates', updates);
    await database()
      .ref()
      .update(updates);

    if (!value) openVideoPlayer({open: false});
  }
  styleButton = () => {
    const {portrait} = this.props;
    let marginTop = marginTopApp + heightHeaderHome;
    if (!portrait) marginTop = marginTopAppLandscape + heightHeaderHome;
    return {
      position: 'absolute',
      zIndex: 20,
      height: 30,
      width: 80,
      left: '5%',
      borderRadius: 15,
      top: marginTop,
    };
  };
  buttonStart() {
    const style = this.styleButton();
    return (
      <Button
        backgroundColor="green"
        onPressColor={colors.greenLight}
        styleButton={style}
        enabled={true}
        text="Share"
        loader={false}
        textButton={{fontSize: 13}}
        click={() => this.startSharingVideo(true)}
      />
    );
  }

  buttonStop() {
    const style = this.styleButton();
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
    const {userID, archives, session} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(session);

    if (!personSharingScreen) return this.buttonStart();
    if (personSharingScreen !== userID) return null;

    if (
      isVideosAreBeingShared({
        session,
        archives,
        userIDSharing: personSharingScreen,
      })
    )
      return this.buttonStop();

    return this.buttonStart();
  }

  render() {
    return this.button();
  }
}

const styles = StyleSheet.create({
  button: {},
});

const mapStateToProps = (state, props) => {
  return {
    userID: state.user.userID,
    portrait: state.layout.currentScreenSize.portrait,
    session: state.coachSessions[props.coachSessionID],
  };
};

export default connect(
  mapStateToProps,
  {},
)(ButtonShareVideo);
