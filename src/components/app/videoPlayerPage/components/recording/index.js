import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {connect} from 'react-redux';

class Recording extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewStartTime: null,
      recordingStartTime: null,
      isPreviewing: false,
    };
  }
  componentDidMount = () => {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.launchIfPreview();
  };
  componentDidUpdate = (prevProps, prevState) => {
    const {isVideoPlayerReady, isAudioPlayerReady} = this.props;
    const {isPreviewing} = this.state;
    if (isVideoPlayerReady && !isPreviewing) this.launchIfPreview();
  };
  launchIfPreview = async () => {
    const {archive, preparePlayer} = this.props;
    const {recordedActions} = archive;
    if (recordedActions) {
      await preparePlayer({url: archive.audioRecordUrl, isCloud: true});
      this.previewRecording({recordedActions});
    }
  };

  waitForAction = async (action) => {
    while (true) {
      const {isPreviewing, previewStartTime} = this.state;
      const timeLeft =
        action.startRecordingOffset - (Date.now() - previewStartTime);
      if (timeLeft < 50 || !isPreviewing) {
        return true;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, timeLeft > 1500 ? 1000 : 10);
      });
    }
  };
  previewRecording = async ({recordedActions}) => {
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
    await this.setState({
      isPreviewing: true,
      previewStartTime: Date.now(),
    });

    playRecord();

    for (const action of recordedActions) {
      const {isPreviewing} = this.state;
      if (isPreviewing) {
        const {type} = action;

        switch (type) {
          case 'play':
            await this.waitForAction(action).then(() => {
              setVideoPlayerState({
                currentTime: action.timestamp,
                paused: false,
              });
            });
            break;
          case 'pause':
            await this.waitForAction(action).then(() => {
              setVideoPlayerState({
                currentTime: action.timestamp,
                paused: true,
              });
            });
            break;
          case 'changePlayRate':
            await this.waitForAction(action).then(() => {
              setVideoPlayerState({
                playRate: action.playRate,
              });
            });
            break;
          case 'seek':
            await this.waitForAction(action).then(() => {
              seekVideoPlayer(action.timestamp);
              setVideoPlayerState({
                currentTime: action.timestamp,
              });
            });
            break;
          case 'zoom':
            await this.waitForAction(action).then(() => {
              setNewScale(action.scale);
            });
            break;
          case 'drag':
            await this.waitForAction(action).then(() => {
              setNewPosition(action.position);
            });
            break;
          case 'draw':
            await this.waitForAction(action).then(() => {
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

    await this.setState({isPreviewing: false});
    setDisplayButtonReplay(true);
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
