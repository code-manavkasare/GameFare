import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {connect} from 'react-redux';
import {timeout} from '../../../../functions/coach';

class Recording extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
    };
  }
  componentDidMount = () => {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.launchIfPreview();
  };
  componentDidUpdate = (prevProps, prevState) => {
    const {isVideoPlayerReady, isPlayingReview} = this.props;

    if (isVideoPlayerReady && !isPlayingReview) this.launchIfPreview();
  };

  togglePlayPause = async () => {
    const {isPlayingReview, setState} = this.props;
    const {currentIndex} = this.state;
    if (isPlayingReview) return setState({isPlayingReview: false});

    await setState({
      isPlayingReview: true,
      previewStartTime: Date.now(),
    });
    const {recordedActions} = this.props;

    return this.previewRecording({recordedActions, initialIndex: currentIndex});
  };

  launchIfPreview = async () => {
    const {archive, preparePlayer, setState, recordedActions} = this.props;

    if (recordedActions.length > 0) {
      await preparePlayer({url: archive.audioRecordUrl, isCloud: true});
      await setState({
        isPlayingReview: true,
        previewStartTime: Date.now(),
      });
      this.previewRecording({recordedActions, initialIndex: 0});
    }
  };

  waitForAction = async (action, index) => {
    while (true) {
      const {previewStartTime} = this.props;

      const timeLeft =
        action.startRecordingOffset - (Date.now() - previewStartTime);
      if (timeLeft < 50) return true;
      await timeout(timeLeft > 1500 ? 1000 : 10);
    }
  };

  previewRecording = async ({recordedActions, initialIndex}) => {
    const {toggleVisibleSeekBar} = this.props;

    toggleVisibleSeekBar(false);
    const {
      setVideoPlayerState,
      seekVideoPlayer,
      setNewPosition,
      setDrawings,
      setNewScale,
      playRecord,
      setDisplayButtonReplay,
    } = this.props;

    playRecord();

    for (let i in recordedActions.slice(initialIndex)) {
      const action = recordedActions.slice(initialIndex)[i];
      var {isPlayingReview} = this.props;
      if (isPlayingReview) {
        const {type} = action;

        await this.setState({currentIndex: Number(i) + initialIndex});

        switch (type) {
          case 'play':
            await this.waitForAction(action).then(() => {
              var {isPlayingReview} = this.props;
              if (isPlayingReview)
                setVideoPlayerState({
                  currentTime: action.timestamp,
                  paused: false,
                });
            });
            break;
          case 'pause':
            await this.waitForAction(action).then(() => {
              var {isPlayingReview} = this.props;
              if (isPlayingReview)
                setVideoPlayerState({
                  currentTime: action.timestamp,
                  paused: true,
                });
            });
            break;
          case 'changePlayRate':
            await this.waitForAction(action).then(() => {
              var {isPlayingReview} = this.props;
              if (isPlayingReview)
                setVideoPlayerState({
                  playRate: action.playRate,
                });
            });
            break;
          case 'seek':
            await this.waitForAction(action).then(() => {
              var {isPlayingReview} = this.props;
              if (isPlayingReview) seekVideoPlayer(action.timestamp);
              setVideoPlayerState({
                currentTime: action.timestamp,
              });
            });
            break;
          case 'zoom':
            await this.waitForAction(action).then(() => {
              var {isPlayingReview} = this.props;
              if (isPlayingReview) setNewScale(action.scale);
            });
            break;
          case 'drag':
            await this.waitForAction(action).then(() => {
              var {isPlayingReview} = this.props;
              if (isPlayingReview) setNewPosition(action.position);
            });
            break;
          case 'draw':
            await this.waitForAction(action).then(() => {
              var {isPlayingReview} = this.props;
              if (isPlayingReview)
                setDrawings({
                  drawings: action.drawings,
                });
            });
            break;
          default:
            console.log(
              `case ${action.type} not handled, action received : ${action}`,
            );
        }
      }
    }
    var {isPlayingReview, setState} = this.props;
    if (isPlayingReview) {
      setDisplayButtonReplay(true);
      setState({isPlayingReview: false});
    }
  };
  render() {
    return null;
  }
}

const mapStateToProps = (state, props) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(Recording);
