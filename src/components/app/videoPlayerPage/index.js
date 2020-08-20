import React, {Component} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';
import Orientation from 'react-native-orientation-locker';
import {Player, Recorder} from '@react-native-community/audio-toolkit';

import VideoPlayer from '../coachFlow/VideoPlayer/index';
import VideoPlayerHeader from './components/VideoPlayerHeader';
import Button from '../../layout/buttons/Button';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import {
  marginTopApp,
  heightHeaderHome,
  marginTopAppLandscape,
} from '../../style/sizes';
import {
  openVideoPlayer,
  getFirebaseVideoByID,
  getLocalVideoByID,
} from '../../functions/videoManagement';

class VideoPlayerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditMode: false,
      isRecording: false,
      recordingStartTime: null,
      recordedActions: [],
      loader: false,
      isPreviewing: false,
      previewStartTime: null,
      audioPlayer: null,
      audioRecorder: null,
      audioFilePath: null,
      landscape: false,
      archives: [],
      disableControls: false,
    };
    this.videoPlayerRefs = [];
    this.focusListener = null;
  }

  _orientationListener(o) {
    if (o === 'LANDSCAPE-LEFT' || o === 'LANDSCAPE-RIGHT') {
      this.setState({landscape: true});
    } else {
      this.setState({landscape: false});
    }
  }

  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
    });
    Orientation.addOrientationListener(this._orientationListener.bind(this));
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
    Orientation.removeOrientationListener(this._orientationListener.bind(this));
  }

  static getDerivedStateFromProps(props, state) {
    if (props.route?.params?.archives && state.archives.length === 0) {
      return {
        archives: props.route.params.archives,
      };
    }
    return {};
  }

  startRecording = async () => {
    this.videoPlayerRefs.forEach((ref) => {
      ref?.PinchableBoxRef?.resetPosition();
    });
    await this.setState({
      isRecording: true,
      recordedActions: [],
      recordingStartTime: Date.now(),
      // audioRecorder: await new Recorder('audio.mp4').prepare((err, fsPath) => {
      //   if (err) {
      //     console.log(err);
      //   }
      //   console.log(fsPath);
      //   this.setState({audioFilePath: fsPath});
      // }),
    });
    // this.state.audioRecorder.record();
    this.initialiseRecordingWithPlayerCurrentState();
  };

  stopRecording = () => {
    // this.state.audioRecorder.stop();
    this.setState({
      isRecording: false,
      recordingStartTime: null,
    });
    this.resetPlayers();
  };

  resetPlayers = () => {
    this.videoPlayerRefs.forEach((ref) => {
      ref?.setState({
        currentTime: 0,
        paused: true,
        playRate: 1,
      });
      ref?.visualSeekBarRef?.setCurrentTime(0, true);
      ref?.player?.seek(0);
      ref?.PinchableBoxRef?.resetPosition();
    });
  };

  initialiseRecordingWithPlayerCurrentState = () => {
    this.videoPlayerRefs.forEach((ref, i) => {
      const currentTime = ref.visualSeekBarRef?.getCurrentTime();
      const playRate = ref.state?.playRate;
      this.onSlidingEnd(i, currentTime);
      this.onPlayRateChange(i, playRate, currentTime);
      // this.onPlayPause(i, false, currentTime);
    });
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

  // isTimestampReached = async (timestampToWait, index) => {
  //   console.log('isTimestampReached', timestampToWait, index);
  //   while (true) {
  //     const {isPreviewing} = this.state;
  //     const currentTime = this.videoPlayerRefs[index].visualSeekBarRef?.getCurrentTime();
  //     if (
  //       (timestampToWait < currentTime + 0.01 &&
  //         timestampToWait > currentTime - 0.01) ||
  //       !isPreviewing
  //     ) {
  //       return true;
  //     }
  //     await new Promise((resolve) => {
  //       setTimeout(resolve, 10);
  //     });
  //   }
  // };

  previewRecording = async () => {
    await this.setState({
      isPreviewing: true,
      previewStartTime: Date.now(),
      audioPlayer: new Player('audio.mp4').play(),
      disableControls: true,
    });
    const {recordedActions} = this.state;
    for (const action of recordedActions) {
      const {isPreviewing} = this.state;
      if (isPreviewing) {
        const {type, index} = action;
        switch (type) {
          case 'play':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].setState({
                currentTime: action.timestamp,
                paused: false,
              });
            });
            break;
          case 'pause':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].setState({
                currentTime: action.timestamp,
                paused: true,
              });
            });
            break;
          case 'changePlayRate':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].setState({
                playRate: action.playRate,
              });
            });
            break;
          // case 'willSeek':
          //   //Useful to wait for seek methods
          //   await this.waitForAction(action).then(() => {});
          //   break;
          case 'seek':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].setState({
                currentTime: action.timestamp,
              });
            });
            break;
          case 'zoom':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].PinchableBoxRef.setNewScale(
                action.scale,
              );
            });
            break;
          case 'drag':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].PinchableBoxRef.setNewPosition(
                action.position,
              );
            });
            break;
          // case 'addVideo':
          //   await this.waitForAction(action).then(() => {
          //     const addedArchive = getFirebaseVideoByID(action.videoID);
          //     let {archives} = this.state;
          //     archives.push(addedArchive);
          //     this.setState({archives});
          //   });
          //   break;
          default:
            console.log(`case ${action.type} not handled`);
        }
      }
    }

    await this.setState({isPreviewing: false, disableControls: false});
  };
  cancelPreviewRecording = async () => {
    await this.state.audioPlayer.stop(() => {
      this.setState({
        isPreviewing: false,
        previewStartTime: null,
        audioPlayer: null,
        disableControls: false,
      });
    });
    await this.resetPlayers();
  };
  onPlayPause = (i, paused, currentTime) => {
    let {recordedActions} = this.state;
    const {recordingStartTime} = this.state;
    recordedActions.push({
      type: paused ? 'pause' : 'play',
      index: i,
      startRecordingOffset: Date.now() - recordingStartTime,
      timestamp: currentTime,
    });
    this.setState({recordedActions});
  };
  onScaleChange = (i, scale) => {
    let {recordedActions} = this.state;
    const {recordingStartTime} = this.state;
    recordedActions.push({
      type: 'zoom',
      index: i,
      startRecordingOffset: Date.now() - recordingStartTime,
      scale,
    });
    this.setState({recordedActions});
  };
  onPositionChange = (i, position) => {
    let {recordedActions} = this.state;
    const {recordingStartTime} = this.state;
    recordedActions.push({
      type: 'drag',
      index: i,
      startRecordingOffset: Date.now() - recordingStartTime,
      position: {...position},
    });
    this.setState({recordedActions});
  };
  onPlayRateChange = (i, playRate, timestamp) => {
    let {recordedActions} = this.state;
    const {recordingStartTime} = this.state;
    recordedActions.push({
      type: 'changePlayRate',
      index: i,
      startRecordingOffset: Date.now() - recordingStartTime,
      playRate,
      timestamp,
    });
    this.setState({recordedActions});
  };
  // onSlidingStart = (i, timestamp) => {
  //   let {recordedActions} = this.state;
  //   const {recordingStartTime} = this.state;
  //   recordedActions.push({
  //     type: 'willSeek',
  //     index: i,
  //     startRecordingOffset: Date.now() - recordingStartTime,
  //     timestamp,
  //   });
  //   this.setState({recordedActions});
  // };
  onSlidingEnd = (i, seekTime) => {
    let {recordedActions} = this.state;
    const {recordingStartTime} = this.state;
    recordedActions.push({
      type: 'seek',
      index: i,
      startRecordingOffset: Date.now() - recordingStartTime,
      timestamp: seekTime,
    });
    this.setState({recordedActions});
  };

  // onAddVideo = (videoID) => {
  //   const {recordedActions, recordingStartTime} = this.state;
  //   recordedActions.push({
  //     type: 'addVideo',
  //     startRecordingOffset: Date.now() - recordingStartTime,
  //     id: videoID,
  //   })
  // }

  header = () => {
    const {isEditMode, isRecording, isPreviewing} = this.state;
    const {goBack, navigate} = this.props.navigation;
    return (
      <VideoPlayerHeader
        isEditMode={isEditMode}
        isRecording={isRecording}
        isPreviewing={isPreviewing}
        close={() => {
          for (const videoPlayerRef of this.videoPlayerRefs) {
            videoPlayerRef?.togglePlayPause(true);
            videoPlayerRef?.PinchableBoxRef?.resetPosition();
          }
          this.resetPlayers();
          this.setState({recordedActions: []});
          openVideoPlayer({}, false, () => goBack());
        }}
        editModeOn={() => {
          this.setState({isEditMode: true});
        }}
        editModeOff={() => {
          this.setState({isEditMode: false, isRecording: false});
        }}
        addVideo={() => {
          navigate('SelectVideosFromLibrary', {
            selectableMode: true,
            selectOnly: true,
            selectOne: true,
            confirmVideo: (selectedLocalVideos, selectedFirebaseVideos) => {
              let addedArchive = null;
              if (selectedLocalVideos.length >= 1) {
                const id = selectedLocalVideos[0];
                addedArchive = getLocalVideoByID(id);
              } else if (selectedFirebaseVideos.length >= 1) {
                const id = selectedFirebaseVideos[0];
                addedArchive = getFirebaseVideoByID(id);
              }
              if (addedArchive) {
                let {archives} = this.state;
                archives.push(addedArchive);
                this.setState({archives});
                // this.onAddVideo(addedArchive.id);
              }
            },
          });
        }}
      />
    );
  };

  getMarginTop = () => {
    const {portrait} = this.props;
    return heightHeaderHome + (portrait ? marginTopApp : marginTopAppLandscape);
  };

  buttonPreview = () => {
    const {isEditMode, isPreviewing, isRecording, recordedActions} = this.state;
    const style = {
      ...styles.buttonRecording,
      top: this.getMarginTop(),
      left: '5%',
    };
    if (isEditMode && !isRecording && recordedActions.length > 0) {
      return isPreviewing ? (
        <Button
          backgroundColor="red"
          onPressColor={colors.green}
          styleButton={style}
          text="Cancel Preview"
          textButton={{fontSize: 13}}
          click={() => this.cancelPreviewRecording()}
        />
      ) : (
        <Button
          backgroundColor="green"
          onPressColor={colors.green}
          styleButton={style}
          text="Preview"
          textButton={{fontSize: 13}}
          click={() => this.previewRecording()}
        />
      );
    }
  };

  buttonRecording = () => {
    const {isEditMode, isRecording} = this.state;
    const style = {
      ...styles.buttonRecording,
      top: this.getMarginTop(),
    };
    return isEditMode ? (
      isRecording ? (
        <Button
          backgroundColor="red"
          onPressColor={colors.green}
          styleButton={style}
          text="stop recording"
          textButton={{fontSize: 13}}
          click={() => this.stopRecording()}
        />
      ) : (
        <Button
          backgroundColor="green"
          onPressColor={colors.red}
          styleButton={style}
          text="start recording"
          textButton={{fontSize: 13}}
          click={() => this.startRecording()}
        />
      )
    ) : null;
  };

  playerStyleByIndex = (i, total) => {
    const {landscape} = this.state;
    const {height, width} = Dimensions.get('screen');
    let style = {position: 'absolute'};
    if (landscape) {
      style = {
        ...style,
        left: 0 + i * (width / total),
        height: height,
        width: width / total,
      };
    } else {
      style = {
        ...style,
        bottom: 0 + i * (height / total),
        width: width,
        height: height / total,
      };
    }
    return style;
  };

  singlePlayer = (archive, i) => {
    const numArchives = this.state.archives.length;
    const {url, thumbnail} = archive;
    const {userID} = this.props;
    const {isRecording, disableControls} = this.state;
    const {
      onPlayPause,
      onPlayRateChange,
      onScaleChange,
      onPositionChange,
      onSlidingEnd,
      // onSlidingStart,
    } = this;
    const propsWhenRecording = isRecording
      ? {
          onPlayPause,
          onPlayRateChange,
          onScaleChange,
          onPositionChange,
          onSlidingEnd,
          // onSlidingStart,
        }
      : {};
    const playerStyle = this.playerStyleByIndex(i, numArchives);
    const seekbarSize = numArchives > 1 ? 'sm' : 'lg';
    return (
      <View style={playerStyle} key={archive.id}>
        <VideoPlayer
          disableControls={disableControls}
          seekbarSize={seekbarSize}
          width={playerStyle.width}
          source={url}
          index={i}
          resizeMode="contain"
          userID={userID}
          setSizeVideo={(sizeVideo) => {
            this.setState({sizeVideo: sizeVideo});
          }}
          noUpdateInCloud={true}
          hideFullScreenButton={true}
          placeHolderImg={thumbnail}
          styleContainerVideo={{...styleApp.center, ...styleApp.fullSize}}
          styleVideo={styleApp.fullSize}
          {...propsWhenRecording}
          onRef={(ref) => {
            this.videoPlayerRefs[i] = ref;
          }}
        />
      </View>
    );
  };

  watchVideosView = () => {
    const {archives} = this.state;
    return (
      <View style={[styleApp.stylePage, {backgroundColor: colors.title}]}>
        {this.header()}
        {this.buttonRecording()}
        {this.buttonPreview()}
        {archives.map((archive, i) => this.singlePlayer(archive, i))}
      </View>
    );
  };

  render = () => {
    return this.watchVideosView();
  };
}

const styles = StyleSheet.create({
  buttonRecording: {
    position: 'absolute',
    zIndex: 600,
    height: 30,
    width: 110,
    right: '5%',
    borderRadius: 15,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentSessionID: state.coach.currentSessionID,
    portrait: state.layout.currentScreenSize.portrait,
  };
};

export default connect(
  mapStateToProps,
  {},
)(VideoPlayerPage);
