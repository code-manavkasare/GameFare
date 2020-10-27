import React, {Component} from 'react';
import {View, StyleSheet, Dimensions, StatusBar} from 'react-native';
import {connect} from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import database from '@react-native-firebase/database';

import SinglePlayer from './components/SinglePlayer';
import VideoPlayerHeader from './components/VideoPlayerHeader';
import AudioRecorderPlayer from './components/AudioRecorderPlayer';

import {isArchiveUploading} from '../../functions/upload.js';
import {logMixpanel} from '../../functions/logs';

import colors from '../../style/colors';

import {
  marginTopApp,
  heightHeaderHome,
  marginTopAppLandscape,
} from '../../style/sizes';
import {openVideoPlayer} from '../../functions/videoManagement';
import {getArchiveByID} from '../../functions/archive';

import {
  isVideosAreBeingShared,
  isSomeoneSharingScreen,
  updateInfoVideoCloud,
} from '../../functions/coach';
import {
  checkIfAllArchivesAreLocal,
  generatePreview,
  generatePreviewCloud,
} from '../../functions/review';
import RecordingMenu from './components/recording/components/RecordingMenu';

class VideoPlayerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      archives: props.route?.params?.archives,
      linkedPlayers: [],
      disableControls: false,
      isDrawingEnabled: false,
      isEditMode: false,
      isPreviewing: false,
      isRecording: false,
      landscape: false,
      recordedActions: false,
      isAudioPlayerReady: false,
      prevCameraState: props.cameraAvailability,
    };
    this.videoPlayerRefs = [];
    this.focusListener = null;
  }
  componentDidMount = () => {
    const {navigation} = this.props;

    this.focusListener = navigation.addListener('focus', () => {
      StatusBar.setBarStyle('light-content', true);
      Orientation.unlockAllOrientations();
    });

    this.focusListener = navigation.addListener('blur', () => {
      StatusBar.setBarStyle('dark-content', true);
    });
    Orientation.addOrientationListener(this._orientationListener.bind(this));

    this.autoShareOnOpen();
  };

  static getDerivedStateFromProps(props, state) {
    const {archives, objectID} = props.route.params;
    const {linkedPlayers} = state;
    if (!archives) {
      return {
        archives: [objectID],
        linkedPlayers: [objectID].map((x) => new Set()),
      };
    }
    if (archives.length > linkedPlayers.length) {
      return {
        archives,
        linkedPlayers: archives.map((x) => new Set()),
      };
    }
    return {};
  }

  _orientationListener(o) {
    if (o === 'LANDSCAPE-LEFT' || o === 'LANDSCAPE-RIGHT') {
      this.setState({landscape: true});
    } else {
      this.setState({landscape: false});
    }
  }

  autoShareOnOpen = () => {
    const {params} = this.props.route;

    if (params.forceSharing)
      this.headerRef.buttonShareRef.startSharingVideo(true);
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

      if (videosBeingShared) {
        const prevVideos = Object.keys(
          session?.members[personSharingScreen]?.sharedVideos,
        );
        const nextVideos = Object.keys(
          nextSession?.members[personSharingScreen]?.sharedVideos,
        );

        if (
          archives.length !== nextVideos.length &&
          nextVideos.length !== prevVideos.length
        ) {
          this.setState({archives: nextVideos});
        }
      }
    }
  }

  startRecording = async () => {
    this.videoPlayerRefs.forEach((ref) => {
      ref?.videoPlayerRef?.PinchableBoxRef?.resetPosition();
      ref?.videoPlayerRef?.setRecording(true);
      ref?.toggleVisibleSeekBar(true);
      ref?.setState({displayButtonReplay: false});
    });
    logMixpanel({
      label: 'startRecording',
      params: {},
    });
    await this.setState({
      isRecording: true,
      recordedActions: [],
      recordingStartTime: Date.now(),
    });
    const currenTime = this.videoPlayerRefs[0].getCurrentTime();

    await this.onCurrentTimeChange(0, currenTime);
    await this.videoPlayerRefs[0].togglePlayPause(true);
    const {isMicrophoneMuted} = this.recordingMenuRef.getState();
    this.AudioRecorderPlayerRef?.startRecording(isMicrophoneMuted);
    this.initialiseRecordingWithPlayerCurrentState();
  };

  stopRecording = async () => {
    await this.onPlayPause(0, true);
    logMixpanel({
      label: 'stopRecording',
      params: {recordedActions: this.state.recordedActions},
    });
    const {isMicrophoneMuted} = this.recordingMenuRef.getState();
    !isMicrophoneMuted && this.AudioRecorderPlayerRef?.stopRecording();

    this.videoPlayerRefs.forEach((ref) => {
      ref?.videoPlayerRef?.setRecording(false);
    });
    await this.videoPlayerRefs[0].toggleVisibleSeekBar(false);
    await this.setState({
      isRecording: false,
      recordingStartTime: null,
    });
    await this.recordingMenuRef.setState({
      isMicrophoneMutedLastValue: isMicrophoneMuted,
    });

    this.videoPlayerRefs[0].replayRecording();
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
      this.onCurrentTimeChange(i, currentTime);
      this.onPlayRateChange(i, playRate, currentTime);
      this.onDrawingChange(i, drawings);
      ref?.videoPlayerRef?.setState({
        paused: true,
      });
    });
  };

  onPlayPause = async (i, paused, currentTime) => {
    let {recordedActions} = this.state;

    if (currentTime === undefined || currentTime === false)
      currentTime = this.videoPlayerRefs[i].getCurrentTime();
    const {recordingStartTime} = this.state;
    recordedActions.push({
      type: paused ? 'pause' : 'play',
      index: i,
      startRecordingOffset: Date.now() - recordingStartTime,
      timestamp: currentTime,
    });
    return this.setState({recordedActions});
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
  onCurrentTimeChange = async (i, seekTime) => {
    let {recordedActions} = this.state;
    const {recordingStartTime} = this.state;

    recordedActions.push({
      type: 'seek',
      index: i,
      startRecordingOffset: Date.now() - recordingStartTime,
      timestamp: seekTime,
    });
    return this.setState({recordedActions});
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
    const {isMicrophoneMutedLastValue} = this.recordingMenuRef.getState();
    const {archives, recordedActions} = this.state;
    const {userID, videoInfos} = this.props;
    const audioFilePath = this.AudioRecorderPlayerRef.state.audioFilePath;
    logMixpanel({
      label: 'Save review',
      params: {userID, recordedActions},
    });
    for (const videoInfo of Object.values(videoInfos)) {
      if (videoInfo.local) {
        const localVideoInfo = getArchiveByID(archives[0]);
        await generatePreview(
          localVideoInfo.url,
          recordedActions,
          audioFilePath,
          isMicrophoneMutedLastValue,
        );
        this.props.navigation.navigate('Alert', {
          close: true,
          title: 'Video successfully created!',
          subtitle: 'Your recording is now in your library!',
          textButton: 'Got it!',
        });
      } else {
        await generatePreviewCloud(
          userID,
          videoInfo,
          recordedActions,
          audioFilePath,
          isMicrophoneMutedLastValue,
        );
        this.props.navigation.navigate('Alert', {
          close: true,
          title: 'Your recording is being processed!',
          subtitle: 'We will notify you when the video is ready.',
          textButton: 'Got it!',
        });
      }
    }
  };

  header = () => {
    const {
      isEditMode,
      isRecording,
      isPreviewing,
      isDrawingEnabled,
      archives,
      recordedActions,
    } = this.state;
    const {
      navigation,
      route,
      session,
      videoInfos,
      userConnected,
      currentSessionID: coachSessionID,
      portrait,
    } = this.props;
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
        onRef={(ref) => {
          this.headerRef = ref;
        }}
        portrait={portrait}
        isEditMode={isEditMode}
        isRecording={isRecording}
        isPreviewing={isPreviewing}
        isDrawingEnabled={isDrawingEnabled}
        videoInfos={videoInfos}
        userConnected={userConnected}
        recordedActions={recordedActions}
        archives={archives}
        personSharingScreen={personSharingScreen}
        coachSessionID={coachSessionID}
        togglePlayPause={() => this.videoPlayerRef.togglePlayPause(true)}
        getVideoState={(id) => {
          const index = Object.values(videoInfos).findIndex(
            (item) => item.id === id,
          );
          return this.videoPlayerRefs[index].getState();
        }}
        toggleLinkAllVideos={(link) => {
          this.videoPlayerRefs.map((ref) => {
            ref.togglePlayPause(true);
          });
          this.setState({playbackLinked: link});
        }}
        allowLinking={
          this.videoPlayerRefs !== undefined && this.videoPlayerRefs.length > 1
        }
        route={route}
        navigation={navigation}
        close={() => {
          openVideoPlayer({open: false});
        }}
        editModeOn={() => {
          this.setState({isEditMode: true});
        }}
        editModeOff={() => {
          this.videoPlayerRefs.forEach((ref) => {
            ref?.setState({displayButtonReplay: false});
          });
          this.setState({isEditMode: false, isRecording: false});
        }}
        disableRecord={isArchiveUploading(videoInfos)}
        setState={this.setState.bind(this)}
        addVideo={() => {
          navigate('SelectVideosFromLibrary', {
            selectableMode: true,
            hideCloud: false,
            hideLocal: videosBeingShared ? true : false,
            selectOnly: true,
            selectOne: true,
            navigateBackAfterConfirm: false,
            confirmVideo: async (selectedVideos) => {
              if (videosBeingShared) {
                let updates = {};
                for (let i in selectedVideos) {
                  const id = selectedVideos[i];

                  const sharedVideosPath = `coachSessions/${coachSessionID}/sharedVideos/${id}`;
                  const coachSessionMemberSharingPath = `coachSessions/${coachSessionID}/members/${personSharingScreen}`;
                  updates[`${sharedVideosPath}/currentTime`] = 0;
                  updates[`${sharedVideosPath}/paused`] = true;
                  updates[`${sharedVideosPath}/playRate`] = 1;
                  updates[`${sharedVideosPath}/position`] = {x: 0, y: 0};
                  updates[`${sharedVideosPath}/scale`] = 1;
                  updates[`${sharedVideosPath}/id`] = id;

                  updates[
                    `${coachSessionMemberSharingPath}/shareScreen`
                  ] = true;
                  updates[
                    `${coachSessionMemberSharingPath}/videoIDSharing`
                  ] = id;

                  updates[
                    `coachSessions/${coachSessionID}/members/${personSharingScreen}/sharedVideos/${id}`
                  ] = true;
                }

                await database()
                  .ref()
                  .update(updates);
              }

              let newArchives = archives.concat(selectedVideos);

              newArchives = newArchives.filter(function(x, i, a) {
                return a.indexOf(x) === i;
              });

              await this.setState({archives: newArchives});
              navigation.navigate('VideoPlayerPage', {
                ...this.props.route.params,
                archives: newArchives,
              });
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

  singlePlayer = (videoInfo, i) => {
    const {archives} = this.state;
    const {session, videoInfos, currentSessionID: coachSessionID} = this.props;
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
    const {id: archiveID, local} = videoInfo;
    let numArchives = 0;
    if (videoInfos) numArchives = Object.values(videoInfos).length;
    const {
      isRecording,
      disableControls,
      isDrawingEnabled,
      linkedPlayers,
      playbackLinked,
      isAudioPlayerReady,
    } = this.state;

    const {
      onDrawingChange,
      onPlayPause,
      onPlayRateChange,
      onPositionChange,
      onScaleChange,
      onCurrentTimeChange,
    } = this;
    const propsWhenRecording = isRecording
      ? {
          onDrawingChange,
          onPlayPause,
          onPlayRateChange,
          onPositionChange,
          onScaleChange,
          onCurrentTimeChange,
        }
      : {};

    const {landscape, recordedActions} = this.state;

    return (
      <SinglePlayer
        index={i}
        key={i}
        id={archiveID}
        onRef={(ref) => (this.videoPlayerRefs[i] = ref)}
        disableControls={disableControls}
        preparePlayer={({url, isCloud}) =>
          this.AudioRecorderPlayerRef.preparePlayer({url, isCloud})
        }
        isAudioPlayerReady={isAudioPlayerReady}
        numArchives={numArchives}
        recordedActions={recordedActions}
        isDrawingEnabled={isDrawingEnabled}
        linkedPlayers={linkedPlayers}
        playbackLinked={playbackLinked}
        coachSessionID={coachSessionID}
        isRecording={isRecording}
        videosBeingShared={videosBeingShared}
        personSharingScreen={personSharingScreen}
        local={local}
        landscape={landscape}
        propsWhenRecording={propsWhenRecording}
        playRecord={() => this.AudioRecorderPlayerRef?.playRecord()}
        videoFromCloud={
          videosBeingShared ? session.sharedVideos[archiveID] : {}
        }
        pauseAudioPlayer={() => this.AudioRecorderPlayerRef?.playPause()}
        stopAudioPlayer={() => this.AudioRecorderPlayerRef?.stopPlayingRecord()}
        seekAudioPlayer={(time) => this.AudioRecorderPlayerRef?.seek(time)}
        videoPlayerRefs={this.videoPlayerRefs}
        clickVideo={(index) => this.headerRef?.handleClick(index)}
      />
    );
  };

  render = () => {
    const {isRecording, isEditMode, recordedActions} = this.state;
    const {videoInfos, currentSessionID} = this.props;

    const connectedToSession =
      currentSessionID !== false && currentSessionID !== undefined;
    return (
      <View style={[{flex: 1}, {backgroundColor: colors.title}]}>
        {this.header()}
        <AudioRecorderPlayer
          onRef={(ref) => {
            this.AudioRecorderPlayerRef = ref;
          }}
          connectedToSession={connectedToSession}
        />

        <RecordingMenu
          isRecording={isRecording}
          isEditMode={isEditMode}
          recordedActions={recordedActions}
          previewRecording={() => {
            const {recordedActions} = this.state;
            this.videoPlayerRefs[0].previewRecording({recordedActions});
          }}
          onRef={(ref) => {
            this.recordingMenuRef = ref;
          }}
          stopRecording={this.stopRecording.bind(this)}
          startRecording={this.startRecording.bind(this)}
          saveReview={this.saveReview.bind(this)}
        />

        {videoInfos &&
          Object.values(videoInfos)
            .filter((x) => x)
            .map((videoInfo, i) => this.singlePlayer(videoInfo, i))}
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
  const {currentSessionID} = state.coach;
  const {params} = props.route;
  const archives = params.objectID ? [params.objectID] : params.archives;
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    session: state.coachSessions[currentSessionID],
    cameraAvailability: state.layout.cameraAvailability,
    currentSessionID,
    portrait: state.layout.currentScreenSize.portrait,
    videoInfos: archives.reduce((videoInfos, archiveID) => {
      return {
        ...videoInfos,
        [archiveID]: {...state.archives[archiveID], id: archiveID},
      };
    }, {}),
  };
};

export default connect(
  mapStateToProps,
  {},
)(VideoPlayerPage);
