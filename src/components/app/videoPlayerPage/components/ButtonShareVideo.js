import React, {Component} from 'react';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import Button from '../../../layout/buttons/Button';
import {openVideoPlayer} from '../../../functions/videoManagement';
import {
  isSomeoneSharingScreen,
  isVideosAreBeingShared,
} from '../../../functions/coach';
import colors from '../../../style/colors';
class ButtonShareVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  };
  componentDidUpdate = (prevProps, prevState) => {
    const {session: prevSession} = prevProps;
    const {session} = this.props;
    const {archives} = this.props;
    const prevPersonSharingScreen = isSomeoneSharingScreen(prevSession);
    const personSharingScreen = isSomeoneSharingScreen(session);

    const isVideosWereBeingShared = isVideosAreBeingShared({
      session: prevSession,
      archives: Object.keys(archives),
      userIDSharing: prevPersonSharingScreen,
    });
    const isVideosBeingShared = isVideosAreBeingShared({
      session,
      archives: Object.keys(archives),
      userIDSharing: personSharingScreen,
    });

    if (isVideosWereBeingShared && !isVideosBeingShared)
      return openVideoPlayer({open: false});
  };

  async startSharingVideo(value) {
    const {userID, coachSessionID, archives, getVideoState} = this.props;

    let updates = {};
    for (let i in archives) {
      const {id} = archives[i];
      const stateVideo = getVideoState(i);

      const sharedVideosPath = `coachSessions/${coachSessionID}/sharedVideos/${id}`;
      const coachSessionMemberSharingPath = `coachSessions/${coachSessionID}/members/${userID}`;
      if (value) {
        updates[`${sharedVideosPath}/currentTime`] = stateVideo.currentTime;
        updates[`${sharedVideosPath}/paused`] = true;
        updates[`${sharedVideosPath}/playRate`] = 1;
        updates[`${sharedVideosPath}/position`] = {x: 0, y: 0};
        updates[`${sharedVideosPath}/scale`] = 1;
        updates[`${sharedVideosPath}/id`] = id;

        updates[`${coachSessionMemberSharingPath}/shareScreen`] = true;
        updates[`${coachSessionMemberSharingPath}/videoIDSharing`] = id;
      } else {
        updates[`${coachSessionMemberSharingPath}/shareScreen`] = false;
        updates[`${coachSessionMemberSharingPath}/sharedVideos`] = null;
      }
    }

    updates[
      `coachSessions/${coachSessionID}/members/${userID}/sharedVideos`
    ] = Object.values(archives).reduce(function(result, item) {
      result[item.id] = true;
      return result;
    }, {});
    await database()
      .ref()
      .update(updates);

    if (!value) openVideoPlayer({open: false});
  }
  styleButton = () => {
    return {
      height: 37,
      width: 160,
      marginTop: 5,
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
        text="Share live"
        loader={false}
        textButton={{fontSize: 12, marginLeft: 25}}
        icon={{
          name: 'play',
          type: 'font',
          size: 16,
          color: 'white',
        }}
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
        textButton={{fontSize: 12, marginLeft: 25}}
        icon={{
          name: 'stop',
          type: 'font',
          size: 16,
          color: 'white',
        }}
        text="Stop sharing"
        loader={false}
        click={() => this.startSharingVideo(false)}
      />
    );
  }
  button() {
    const {userID, archives, session, isEditMode} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(session);
    if (isEditMode) return null;
    if (!personSharingScreen) return null;
    if (personSharingScreen !== userID) return null;

    if (
      isVideosAreBeingShared({
        session,
        archives,
        userIDSharing: personSharingScreen,
      })
    )
      return this.buttonStop();
    return null;
  }

  render() {
    return this.button();
  }
}

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
