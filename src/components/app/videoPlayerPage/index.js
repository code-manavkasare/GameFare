import React, {Component} from 'react';
import {View, InteractionManager} from 'react-native';
import {connect} from 'react-redux';

import database from '@react-native-firebase/database';

import SinglePlayer from './components/SinglePlayer';
import VideoPlayerHeader from './components/VideoPlayerHeader';
import AudioRecorderPlayer from './components/AudioRecorderPlayer';

import {isArchiveUploading} from '../../functions/upload.js';
import {logMixpanel} from '../../functions/logs';
import FocusListeners from '../../hoc/focusListeners';

import colors from '../../style/colors';

import {
  marginTopApp,
  heightHeaderHome,
  marginTopAppLandscape,
} from '../../style/sizes';
import {openVideoPlayer} from '../../functions/videoManagement';
import {getArchiveByID} from '../../functions/archive';
import {boolShouldComponentUpdate} from '../../functions/redux';

import {
  isVideosAreBeingShared,
  isSomeoneSharingScreen,
  timeout,
} from '../../functions/coach';
import {
  generatePreview,
  generatePreviewCloud,
  videoIsReview,
} from '../../functions/review';

import RecordingMenu from './components/recording/components/RecordingMenu';
import {
  userConnectedSelector,
  userIDSelector,
} from '../../../store/selectors/user';
import {
  cameraAvailabilitySelector,
  portraitSelector,
} from '../../../store/selectors/layout';
import {
  currentSessionIDSelector,
  sessionSelector,
} from '../../../store/selectors/sessions';
import {watchVideosLive} from '../../database/firebase/videosManagement';

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
      recordedActions: false,
      isAudioPlayerReady: false,
      prevCameraState: props.cameraAvailability,
    };
    this.videoPlayerRefs = [];
    this.focusListener = null;
  }
  componentDidMount = () => {
    InteractionManager.runAfterInteractions(() => {
      this.autoShareOnOpen();
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'VideoPlayerPage',
    });
  }

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

  autoShareOnOpen = () => {
    const {params} = this.props.route;

    if (params.forceSharing)
      this.headerRef.buttonShareRef.startSharingVideo(true);
  };

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
        let prevShareVideos =
          session?.members[personSharingScreen]?.sharedVideos;
        if (!prevShareVideos) prevShareVideos = {};
        let nextShareVideos =
          nextSession?.members[personSharingScreen]?.sharedVideos;
        if (!prevShareVideos) nextShareVideos = {};
        const prevVideos = Object.keys(prevShareVideos);
        const nextVideos = Object.keys(nextShareVideos);

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
    !isMicrophoneMuted && (await this.AudioRecorderPlayerRef?.stopRecording());

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
    await timeout(700);
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
    const {isMicrophoneMutedLastValue} = this.recordingMenuRef.getState();
    const {archives, recordedActions} = this.state;
    const {userID} = this.props;
    const {
      audioFilePath,
      audioFileDuration,
    } = this.AudioRecorderPlayerRef.state;

    logMixpanel({
      label: 'Save review',
      params: {userID, recordedActions},
    });
    const archive = getArchiveByID(archives[0]);
    if (archive.local) {
      await generatePreview({
        audioFilePath,
        audioFileDuration,
        isMicrophoneMuted: isMicrophoneMutedLastValue,
        recordedActions,
        source: archive.url,
      });
      this.props.navigation.navigate('Alert', {
        close: true,
        title: 'Video successfully created!',
        subtitle: 'Your recording is now in your library!',
        textButton: 'Got it!',
      });
    } else {
      await generatePreviewCloud({
        audioFileDuration,
        audioFilePath,
        isMicrophoneMuted: isMicrophoneMutedLastValue,
        userId: userID,
        videoInfo: archive,
        recordedActions,
      });
      this.props.navigation.navigate('Alert', {
        close: true,
        title: 'Your recording is being processed!',
        subtitle: 'We will notify you when the video is ready.',
        textButton: 'Got it!',
      });
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
        archives={archives}
        userConnected={userConnected}
        recordedActions={recordedActions}
        personSharingScreen={personSharingScreen}
        coachSessionID={coachSessionID}
        getVideoState={(id) => {
          const index = archives.findIndex((item) => item === id);
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
        setState={this.setState.bind(this)}
        addVideo={() => {
          navigate('SelectVideosFromLibrary', {
            selectableMode: true,
            hideCloud: false,
            hideLocal: videosBeingShared ? true : false,
            selectOnly: true,
            selectOne: true,
            navigateBackAfterConfirm: false,
            modalMode: true,
            confirmVideo: async (selectedVideos) => {
              if (videosBeingShared) {
                await watchVideosLive({
                  selectedVideos,
                  coachSessionID,
                  personSharingScreen,
                  overrideCurrent: false,
                });
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

  singlePlayer = ({archiveID, i}) => {
    const {archives} = this.state;
    const {session, currentSessionID: coachSessionID, portrait} = this.props;
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

    const {recordedActions} = this.state;

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
        numArchives={archives.length}
        recordedActions={recordedActions}
        isDrawingEnabled={isDrawingEnabled}
        linkedPlayers={linkedPlayers}
        playbackLinked={playbackLinked}
        coachSessionID={coachSessionID}
        isRecording={isRecording}
        videosBeingShared={videosBeingShared}
        personSharingScreen={personSharingScreen}
        landscape={!portrait}
        propsWhenRecording={propsWhenRecording}
        playRecord={() => this.AudioRecorderPlayerRef?.playRecord()}
        videoFromCloud={
          videosBeingShared ? session.sharedVideos[archiveID] ?? {} : {}
        }
        pauseAudioPlayer={() => this.AudioRecorderPlayerRef?.playPause()}
        stopAudioPlayer={() => this.AudioRecorderPlayerRef?.stopPlayingRecord()}
        seekAudioPlayer={(time) => this.AudioRecorderPlayerRef?.seek(time)}
        videoPlayerRefs={this.videoPlayerRefs}
        clickVideo={() => this.headerRef?.handleClick(i)}
      />
    );
  };

  render = () => {
    const {isRecording, isEditMode, recordedActions, archives} = this.state;
    const {currentSessionID, navigation} = this.props;
    const isReview = videoIsReview(archives);

    const connectedToSession =
      currentSessionID !== false && currentSessionID !== undefined;
    return (
      <View style={[{flex: 1}, {backgroundColor: colors.black}]}>
        <FocusListeners navigation={navigation} />
        {this.header()}
        <AudioRecorderPlayer
          onRef={(ref) => {
            this.AudioRecorderPlayerRef = ref;
          }}
          isReview={isReview}
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

        {archives.map((archiveID, i) => this.singlePlayer({archiveID, i}))}
      </View>
    );
  };
}

const mapStateToProps = (state, props) => {
  const {currentSessionID} = state.coach;
  return {
    userID: userIDSelector(state),
    userConnected: userConnectedSelector(state),
    session: sessionSelector(state, {id: currentSessionID}),
    cameraAvailability: cameraAvailabilitySelector(state),
    currentSessionID: currentSessionIDSelector(state),
    portrait: portraitSelector(state),
  };
};

export default connect(
  mapStateToProps,
  {},
)(VideoPlayerPage);
