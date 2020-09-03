import React, {Component} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import Orientation from 'react-native-orientation-locker';

import SinglePlayer from './components/SinglePlayer';
import VideoPlayerHeader from './components/VideoPlayerHeader';
import ButtonShareVideo from './components/ButtonShareVideo';
import Button from '../../layout/buttons/Button';
import AudioRecorderPlayer from './components/AudioRecorderPlayer';

import colors from '../../style/colors';

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
import {shareCloudVideoWithCoachSession} from '../../database/firebase/videosManagement';
import {
  isVideosAreBeingShared,
  isSomeoneSharingScreen,
} from '../../functions/coach';
import {
  checkIfAllArchivesAreLocal,
  generatePreview,
} from '../../functions/review';

class VideoPlayerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      archives: [],
      disableControls: false,
      isDrawingEnabled: false,
      isEditMode: false,
      isPreviewing: false,
      isRecording: false,
      landscape: false,
      linkedPlayers: [], // each archive has a corresponding set of linkedPlayers
      previewStartTime: null,
      recordedActions: [],
      recordingStartTime: null,
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
    this.launchIfPreview();
  }

  launchIfPreview = () => {
    const {archives} = this.state;
    archives.forEach(async (archive) => {
      const videoInfo = archive.local
        ? getLocalVideoByID(archive.id)
        : getFirebaseVideoByID(archive.id);

      const {recordedActions} = videoInfo;
      if (recordedActions) {
        await this.AudioRecorderPlayerRef.preparePlayer(videoInfo.audioUrl);
        await this.setState({recordedActions});
        this.previewRecording();
      }
    });
  };

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
    Orientation.removeOrientationListener(this._orientationListener.bind(this));
  }

  componentDidUpdate(prevProps, prevState) {
    const {session} = prevProps;
    const {session: nextSession} = this.props;
    const {archives} = prevState;
    let videosBeingShared = false;
    let personSharingScreen = false;
    if (session) {
      personSharingScreen = isSomeoneSharingScreen(session);
      videosBeingShared = isVideosAreBeingShared({
        session,
        archives,
        userIDSharing: personSharingScreen,
      });
      if (personSharingScreen && videosBeingShared) {
        const prevVideos = Object.keys(
          session.members[personSharingScreen].sharedVideos,
        );
        const nextVideos = Object.keys(
          nextSession.members[personSharingScreen].sharedVideos,
        );
        if (
          archives.length !== nextVideos.length &&
          nextVideos.length !== prevVideos.length
        ) {
          const videoToAdd = nextVideos.filter(
            (item) => prevVideos.indexOf(item) == -1,
          )[0];
          let {archives: newArchives} = this.state;

          newArchives = newArchives.concat([{id: videoToAdd}]);
          this.setState({archives: newArchives});
        }
      }
    }
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
      ref?.videoPlayerRef?.PinchableBoxRef?.resetPosition();
      ref?.videoPlayerRef?.setRecording(true);
    });
    await this.setState({
      isRecording: true,
      recordedActions: [],
      recordingStartTime: Date.now(),
    });
    this.AudioRecorderPlayerRef?.startRecording();
    this.initialiseRecordingWithPlayerCurrentState();
  };

  stopRecording = () => {
    this.AudioRecorderPlayerRef?.stopRecording();
    this.videoPlayerRefs.forEach((ref) => {
      ref?.videoPlayerRef?.setRecording(false);
    });
    this.setState({
      isRecording: false,
      recordingStartTime: null,
    });
    this.resetPlayers();
  };

  playersAreLinked = (indexA, indexB) => {
    const {linkedPlayers} = this.state;
    return linkedPlayers[indexA].has(indexB);
  };

  linkPlayers = async (a, b) => {
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
      linkedPlayers[elem] = new Set([...all].filter((i) => i !== elem));
    }
    await this.setState({linkedPlayers});
  };

  unlinkPlayers = async (a, b) => {
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
        linkedPlayers[elem] = new Set([...lower].filter((i) => i !== elem));
      } else {
        linkedPlayers[elem] = new Set([...higher].filter((i) => i !== elem));
      }
    }
    await this.setState({linkedPlayers});
  };

  toggleLink = async (indexA, indexB) => {
    if (this.playersAreLinked(indexA, indexB)) {
      await this.unlinkPlayers(indexA, indexB);
    } else {
      this.videoPlayerRefs[indexA].togglePlayPause(true);
      this.videoPlayerRefs[indexB].togglePlayPause(true);
      await this.linkPlayers(indexA, indexB);
    }
  };

  resetPlayers = () => {
    this.videoPlayerRefs.forEach((ref) => {
      ref?.videoPlayerRef?.PinchableBoxRef?.resetPosition();
      ref?.videoPlayerRef?.setState({
        paused: true,
        playRate: 1,
      });
      ref?.visualSeekBarRef?.setCurrentTime(0, true);
      ref?.player?.seek(0);
      ref.drawViewRef.setState({drawings: {}});
    });
  };

  initialiseRecordingWithPlayerCurrentState = () => {
    this.videoPlayerRefs.forEach((ref, i) => {
      const currentTime = ref.videoPlayerRef?.visualSeekBarRef?.getCurrentTime();
      const playRate = ref.videoPlayerRef?.state?.playRate;
      const drawings = ref.drawViewRef.state.drawings;
      this.onSlidingEnd(i, currentTime);
      this.onPlayRateChange(i, playRate, currentTime);
      this.onDrawingChange(i, drawings);
      this.onPlayPause(i, false, currentTime);
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
    this.AudioRecorderPlayerRef?.playRecord();
    const {recordedActions} = this.state;
    console.log('recorded actions', recordedActions);
    for (const action of recordedActions) {
      const {isPreviewing} = this.state;
      if (isPreviewing) {
        const {type, index} = action;
        switch (type) {
          case 'play':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].videoPlayerRef?.setState({
                currentTime: action.timestamp,
                paused: false,
              });
            });
            break;
          case 'pause':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].videoPlayerRef?.setState({
                currentTime: action.timestamp,
                paused: true,
              });
            });
            break;
          case 'changePlayRate':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].videoPlayerRef?.setState({
                playRate: action.playRate,
              });
            });
            break;
          case 'seek':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].videoPlayerRef?.player?.seek(
                action.timestamp,
              );
              this.videoPlayerRefs[index].videoPlayerRef?.setState({
                currentTime: action.timestamp,
              });
            });
            break;
          case 'zoom':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[
                index
              ]?.videoPlayerRef?.PinchableBoxRef?.setNewScale(action.scale);
            });
            break;
          case 'drag':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[
                index
              ]?.videoPlayerRef.PinchableBoxRef.setNewPosition(action.position);
            });
            break;
          case 'draw':
            await this.waitForAction(action).then(() => {
              this.videoPlayerRefs[index].drawViewRef.setState({
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
    const {isPreviewing} = this.state;
    if (isPreviewing) {
      this.videoPlayerRefs.map((ref) => {
        ref?.videoPlayerRef?.setState({
          paused: true,
        });
      });
    }
    await this.setState({isPreviewing: false, disableControls: false});
  };
  cancelPreviewRecording = async () => {
    this.AudioRecorderPlayerRef?.stopPlayingRecord();
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
  onDrawingChange = (i, drawings) => {
    let {recordedActions} = this.state;
    const {recordingStartTime} = this.state;
    recordedActions.push({
      type: 'draw',
      index: i,
      startRecordingOffset: Date.now() - recordingStartTime,
      drawings,
    });
    this.setState({recordedActions});
  };

  saveReview = async () => {
    //To update for multiple video
    const {archives, recordedActions} = this.state;
    const localVideoInfo = getLocalVideoByID(archives[0].id);
    const audioFilePath = this.AudioRecorderPlayerRef.state.audioFilePath;
    await generatePreview(localVideoInfo.url, recordedActions, audioFilePath);
    this.props.navigation.navigate('Alert', {
      close: true,
      title: 'Video successfully created !',
      subtitle: 'Please check your video library.',
      textButton: 'Got it!',
    });
  };

  header = () => {
    const {
      isEditMode,
      isRecording,
      isPreviewing,
      isDrawingEnabled,
      archives,
    } = this.state;
    const {navigation, route, session, userID} = this.props;
    const {coachSessionID} = route.params;
    const {navigate} = navigation;
    let videosBeingShared = false;
    let personSharingScreen = false;
    if (session) {
      personSharingScreen = isSomeoneSharingScreen(session);
      videosBeingShared = isVideosAreBeingShared({
        session,
        archives,
        userIDSharing: personSharingScreen,
      });
    }
    return (
      <VideoPlayerHeader
        isEditMode={isEditMode}
        isRecording={isRecording}
        isPreviewing={isPreviewing}
        isDrawingEnabled={isDrawingEnabled}
        personSharingScreen={personSharingScreen}
        route={route}
        close={() => {
          openVideoPlayer({open: false});
        }}
        editModeOn={() => {
          this.setState({isEditMode: true});
        }}
        editModeOff={() => {
          this.setState({isEditMode: false, isRecording: false});
        }}
        setState={this.setState.bind(this)}
        addVideo={() => {
          navigate('SelectVideosFromLibrary', {
            selectableMode: true,
            hideCloud: false,
            hideLocal: videosBeingShared ? true : false,
            selectOnly: true,
            selectOne: true,
            confirmVideo: async (
              selectedLocalVideos,
              selectedFirebaseVideos,
            ) => {
              let localVideoInfo = null;
              let cloudVideoInfo = null;
              if (selectedLocalVideos.length >= 1) {
                const id = selectedLocalVideos[0];
                const duplicate = archives.reduce(
                  (duplicate, archive) => duplicate || archive.id === id,
                  false,
                );
                if (duplicate) {
                  return;
                }
                localVideoInfo = getLocalVideoByID(id);
                //cloudVideoInfo = await uploadLocalVideo(localVideoInfo);
              } else if (selectedFirebaseVideos.length >= 1) {
                const id = selectedFirebaseVideos[0];
                const duplicate = archives.reduce(
                  (duplicate, archive) => duplicate || archive.id === id,
                  false,
                );
                if (duplicate) {
                  return;
                }
                cloudVideoInfo = getFirebaseVideoByID(id);
              }
              if (localVideoInfo) {
                let {archives, linkedPlayers} = this.state;
                archives.push(localVideoInfo);
                linkedPlayers.push(new Set());
                await this.setState({archives, linkedPlayers});
              }
              if (cloudVideoInfo) {
                if (videosBeingShared) {
                  shareCloudVideoWithCoachSession(
                    cloudVideoInfo.id,
                    coachSessionID,
                    personSharingScreen,
                  );
                }
                let {archives, linkedPlayers} = this.state;
                archives.push(cloudVideoInfo);
                linkedPlayers.push(new Set());
                await this.setState({archives, linkedPlayers});
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
      top: this.getMarginTop() + 40,
    };
    if (isEditMode && !isRecording && recordedActions.length > 0) {
      return isPreviewing ? (
        <Button
          backgroundColor={colors.red}
          onPressColor={colors.red2}
          styleButton={style}
          text="Cancel Preview"
          textButton={{fontSize: 13}}
          click={() => this.cancelPreviewRecording()}
        />
      ) : (
        <Button
          backgroundColor="green"
          onPressColor={colors.red}
          styleButton={style}
          text="Preview"
          textButton={{fontSize: 13}}
          click={() => this.previewRecording()}
        />
      );
    }
  };

  buttonSave = () => {
    const {isEditMode, isRecording, recordedActions} = this.state;
    const style = {
      ...styles.buttonRecording,
      top: this.getMarginTop() + 80,
    };
    if (isEditMode && !isRecording && recordedActions.length > 0) {
      return (
        <Button
          backgroundColor="red"
          styleButton={style}
          text="Save"
          textButton={{fontSize: 13}}
          click={() => this.saveReview()}
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

  singlePlayer = (archive, i) => {
    const {session} = this.props;
    const {archives} = this.state;
    let videosBeingShared = false;
    let personSharingScreen = false;
    if (session) {
      personSharingScreen = isSomeoneSharingScreen(session);
      videosBeingShared = isVideosAreBeingShared({
        session,
        archives,
        userIDSharing: personSharingScreen,
      });
    }
    const {coachSessionID} = this.props.route.params;
    const {id: archiveID, local} = archive;
    const numArchives = archives.length;

    const {
      isRecording,
      disableControls,
      isDrawingEnabled,
      linkedPlayers,
    } = this.state;

    const {
      onDrawingChange,
      onPlayPause,
      onPlayRateChange,
      onPositionChange,
      onScaleChange,
      onSlidingEnd,
    } = this;
    const propsWhenRecording = isRecording
      ? {
          onDrawingChange,
          onPlayPause,
          onPlayRateChange,
          onPositionChange,
          onScaleChange,
          onSlidingEnd,
        }
      : {};

    const {landscape} = this.state;
    return (
      <SinglePlayer
        index={i}
        key={i}
        id={archiveID}
        onRef={(ref) => (this.videoPlayerRefs[i] = ref)}
        disableControls={disableControls}
        numArchives={numArchives}
        isDrawingEnabled={isDrawingEnabled}
        linkedPlayers={linkedPlayers}
        coachSessionID={coachSessionID}
        videosBeingShared={videosBeingShared}
        personSharingScreen={personSharingScreen}
        local={local}
        landscape={landscape}
        propsWhenRecording={propsWhenRecording}
        videoFromCloud={
          videosBeingShared ? session.sharedVideos[archiveID] : {}
        }
        videoPlayerRefs={this.videoPlayerRefs}
      />
    );
  };
  buttonSharing = () => {
    const {route} = this.props;
    const {archives} = this.state;
    const {coachSessionID} = route.params;
    if (!coachSessionID) {
      return null;
    }

    return (
      <ButtonShareVideo
        archives={archives}
        coachSessionID={coachSessionID}
        togglePlayPause={() => this.videoPlayerRef.togglePlayPause(true)}
        getVideoState={(i) => this.videoPlayerRefs[i].getState()}
      />
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
        top: height / 2 - 25,
        height: 50,
        width: 50,
      };
    } else {
      const gap = height / (total + 1);
      style = {
        ...style,
        bottom: gap * (i + 1) - 25,
        left: width / 2 - 25,
        width: 50,
        height: 50,
      };
    }
    return style;
  };

  linkButtons = () => {
    const {archives} = this.state;
    const adjPairs = archives
      .map((archive, i) => {
        return i === archives.length - 1
          ? null
          : {
              a: i,
              b: i + 1,
            };
      })
      .filter((x) => x);
    const buttons = adjPairs.map(({a, b}, i) => {
      const linkButtonContainer = this.linkButtonStyleByIndex(
        i,
        adjPairs.length,
      );
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
            click={async () => await this.toggleLink(a, b)}
          />
        </View>
      );
    });
    return buttons;
  };

  render = () => {
    const {archives} = this.state;
    const allArchivesLocal = checkIfAllArchivesAreLocal(archives);
    return (
      <View style={[{flex: 1}, {backgroundColor: colors.title}]}>
        {this.header()}
        {this.buttonSharing()}
        <AudioRecorderPlayer
          onRef={(ref) => {
            this.AudioRecorderPlayerRef = ref;
          }}
        />
        {this.buttonRecording()}
        {this.buttonPreview()}
        {allArchivesLocal && this.buttonSave()}
        {archives.map((archive, i) => this.singlePlayer(archive, i))}
        {this.linkButtons()}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  buttonRecording: {
    position: 'absolute',
    zIndex: 600,
    height: 30,
    width: 110,
    left: '5%',
    borderRadius: 15,
  },
  buttonLink: {
    borderRadius: 15,
    height: '100%',
    width: '100%',
  },
});

const mapStateToProps = (state, props) => {
  return {
    userID: state.user.userID,
    session: state.coachSessions[props.route.params.coachSessionID],
    portrait: state.layout.currentScreenSize.portrait,
  };
};

export default connect(
  mapStateToProps,
  {},
)(VideoPlayerPage);
