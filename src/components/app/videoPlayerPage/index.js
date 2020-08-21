import React, {Component} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import Orientation from 'react-native-orientation-locker';

import VideoPlayer from '../coachFlow/VideoPlayer/index';
import VideoPlayerHeader from './components/VideoPlayerHeader';
import Button from '../../layout/buttons/Button';
import AudioRecorderPlayer from './components/AudioRecorderPlayer';

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
      landscape: false,
      archives: [],
      linkedPlayers: [], // each archive has a corresponding set of linkedPlayers
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
        linkedPlayers: props.route.params.archives.map((x) => new Set()),
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
    });
    this.AudioRecorderPlayerRef.startRecording();
    this.initialiseRecordingWithPlayerCurrentState();
  };

  stopRecording = () => {
    this.AudioRecorderPlayerRef.stopRecording();
    this.setState({
      isRecording: false,
      recordingStartTime: null,
    });
    this.resetPlayers();
  };

  playersAreLinked = (indexA, indexB) => {
    const {linkedPlayers} = this.state;
    return linkedPlayers[indexA].has(indexB);
  }

  linkPlayers = (a, b) => {
    let {linkedPlayers} = this.state;
    // union op
    const all = new Set();
    all.add(a);
    all.add(b);
    for (const elem of linkedPlayers[a]) {
      all.add(elem);
    }
    for (const elem of linkedPlayers[b]) {
      all.add(elem);
    }
    for (const elem of all) {
      linkedPlayers[elem] = new Set([...all].filter(i => i !== elem));
    }
    this.setState({linkedPlayers});
  }

  unlinkPlayers = (a, b) => {
    // a < b always true
    let {linkedPlayers} = this.state;
    const all = new Set();
    all.add(a);
    for (const elem of linkedPlayers[a]) {
      all.add(elem);
    }
    const lower = new Set();
    for (const elem of all) {
      if (elem <= a) {
        lower.add(elem);
      }
    }
    const higher = new Set();
    for (const elem of all) {
      if (elem >= b) {
        higher.add(elem);
      }
    }
    for (const elem of all) {
      if (elem <= a) {
        linkedPlayers[elem] = new Set([...lower].filter(i => i !== elem));
      } else {
        linkedPlayers[elem] = new Set([...higher].filter(i => i !== elem));
      }
    }
    this.setState({linkedPlayers});
  }

  toggleLink = (indexA, indexB) => {
    if (this.playersAreLinked(indexA, indexB)) {
      this.unlinkPlayers(indexA, indexB);
    } else {
      this.linkPlayers(indexA, indexB);
    }
  }

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

  previewRecording = async () => {
    await this.setState({
      isPreviewing: true,
      previewStartTime: Date.now(),
      disableControls: true,
    });
    this.AudioRecorderPlayerRef.playRecord();
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
          default:
            console.log(`case ${action.type} not handled`);
        }
      }
    }

    await this.setState({isPreviewing: false, disableControls: false});
  };
  cancelPreviewRecording = async () => {
    this.AudioRecorderPlayerRef.stopPlayingRecord();
    this.setState({
      isPreviewing: false,
      previewStartTime: null,
      audioPlayer: null,
      disableControls: false,
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
                let {archives, linkedPlayers} = this.state;
                archives.push(addedArchive);
                linkedPlayers.push(new Set());
                this.setState({archives, linkedPlayers});
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
    const {isRecording, disableControls, linkedPlayers} = this.state;
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
          linkedPlayers={[...linkedPlayers[i]].map(index => this.videoPlayerRefs[index])}
          {...propsWhenRecording}
          onRef={(ref) => {
            this.videoPlayerRefs[i] = ref;
          }}
        />
      </View>
    );
  };

  linkButtonStyleByIndex = (i, total) => {
    const {landscape} = this.state;
    const {height, width} = Dimensions.get('screen');
    let style = {position: 'absolute'};
    if (landscape) {
      const gap = width / (total + 1);
      style = {
        ...style,
        right: gap * (i + 1) - 15,
        top: (height / 2) - 25,
        height: 50,
        width: 50,
      };
    } else {
      const gap = height / (total + 1);
      style = {
        ...style,
        bottom: gap * (i + 1) - 25,
        left: (width / 2) - 25,
        width: 50,
        height: 50,
      };
    }
    return style;
  };

  linkButtons = () => {
    const {archives} = this.state;
    const adjPairs = archives.map((archive, i) => {
      return i === archives.length - 1
        ? null
        : {
            a: i,
            b: i + 1,
          };
    }).filter(x => x);
    const buttons = adjPairs.map(({a, b}, i) => {
      const linkButtonContainer = this.linkButtonStyleByIndex(i, adjPairs.length);
      return (
        <View style={linkButtonContainer}>
          <Button
            backgroundColor=""
            onPressColor={colors.green}
            styleButton={styles.buttonLink}
            icon={{
              name: this.playersAreLinked(a, b) ? 'link' : 'unlink',
              type: 'font',
              size: 20,
              color: 'white',
            }}
            click={() => this.toggleLink(a, b)}
          />
        </View>

      );
    });
    return buttons;
  };

  watchVideosView = () => {
    const {archives} = this.state;
    return (
      <View style={[styleApp.stylePage, {backgroundColor: colors.title}]}>
        {this.header()}
        <AudioRecorderPlayer
          onRef={(ref) => {
            this.AudioRecorderPlayerRef = ref;
          }}
        />
        {this.buttonRecording()}
        {this.buttonPreview()}
        {archives.map((archive, i) => this.singlePlayer(archive, i))}
        {this.linkButtons()}

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
  buttonLink: {
    borderRadius: 15,
    height: '100%',
    width: '100%',
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
