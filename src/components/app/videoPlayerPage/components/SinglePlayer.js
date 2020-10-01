import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, View, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {isEqual} from 'lodash';

import {archivesAction} from '../../../../actions/archivesActions';

import VideoPlayer from '../../coachFlow/VideoPlayer/index';
import styleApp from '../../../style/style';
import Loader from '../../../layout/loaders/Loader';
import colors from '../../../style/colors';
import DrawTools from './drawing/DrawTools';
import DrawView from './drawing/DrawView';
import {updateInfoVideoCloud} from '../../../functions/coach';
import RecordingComponent from './recording/index';
import AllIcon from '../../../layout/icons/AllIcons';

class SinglePlayer extends Component {
  static propTypes = {
    onRef: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      audioPlayer: null,
      audioRecorder: null,
      audioFilePath: null,
      sizeVideo: {height: 0, width: 0},
      isVideoPlayerReady: false,
      displayButtonReplay: false,
    };
  }

  componentDidMount = () => {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    const {videoFromCloud: prevVideoFromCloud} = prevProps;
    const {
      userID,
      videosBeingShared,
      personSharingScreen,
      coachSessionID,
      id,
      videoFromCloud,
    } = this.props;
    if (videosBeingShared && personSharingScreen === userID) {
      if (
        !isEqual(videoFromCloud.loadedUsers, prevVideoFromCloud.loadedUsers)
      ) {
        const currentTime = this.videoPlayerRef?.visualSeekBarRef?.getCurrentTime();
        const updates = {
          [`coachSessions/${coachSessionID}/sharedVideos/${id}/currentTime/`]: currentTime,
        };
        database()
          .ref()
          .update(updates);
      }
    }
  };

  componentWillUnmount = () => {
    const {id, local, archivesAction} = this.props;
    if (!local) {
      archivesAction('unbindArchive', id);
    }
  };

  playerStyleByIndex = (i, total) => {
    const {landscape} = this.props;
    const {height, width} = Dimensions.get('screen');
    let style = {position: 'absolute'};
    if (landscape) {
      style = {
        ...style,
        left: i * (width / total),
        height: height,
        width: width / total,
      };
    } else {
      style = {
        ...style,
        bottom: i * (height / total),
        width: width,
        height: height / total,
      };
    }
    return style;
  };
  togglePlayPause(forcePause) {
    this.videoPlayerRef.togglePlayPause(forcePause);
  }
  seekDiff(time) {
    this.videoPlayerRef.seekDiff(time);
  }
  getState() {
    return this.videoPlayerRef.getState();
  }
  getSeekBar() {
    return this.videoPlayerRef?.visualSeekBarRef;
  }
  getCurrentTime() {
    return this.videoPlayerRef?.visualSeekBarRef.getCurrentTime();
  }
  toggleVisibleSeekBar(force) {
    return this.videoPlayerRef?.visualSeekBarRef.toggleVisible(force);
  }
  viewLoader(playerStyle) {
    return (
      <View style={[styleApp.fullView, styleApp.center]}>
        <Loader size={50} color={colors.white} />
      </View>
    );
  }
  onLayoutContainer = async (e) => {
    const {x} = e?.nativeEvent?.layout;
    this.videoPlayerRef?.setXOffset(x);
  };
  isDoneBuffering = () => {
    const {
      userID,
      videosBeingShared,
      personSharingScreen,
      coachSessionID,
      id,
    } = this.props;

    if (videosBeingShared && personSharingScreen !== userID) {
      const updates = {
        [`coachSessions/${coachSessionID}/sharedVideos/${id}/loadedUsers/${userID}`]: Date.now(),
      };
      database()
        .ref()
        .update(updates);
    }
  };
  onScaleChange = (index, scale) => {
    const {videosBeingShared, coachSessionID, id} = this.props;
    if (videosBeingShared) {
      const updates = {
        [`coachSessions/${coachSessionID}/sharedVideos/${id}/scale/`]: scale,
      };
      database()
        .ref()
        .update(updates);
    }
  };
  onPositionChange = (index, position) => {
    const {videosBeingShared, coachSessionID, id} = this.props;

    if (videosBeingShared) {
      const {x, y} = position;
      const updates = {
        [`coachSessions/${coachSessionID}/sharedVideos/${id}/position/`]: {
          x,
          y,
        },
      };
      database()
        .ref()
        .update(updates);
    }
  };
  previewRecording = (props) => {
    this.recordingRef.previewRecording(props);
  };
  singlePlayer = () => {
    const {
      archive,
      coachSessionID,
      disableControls,
      id,
      index,
      isDrawingEnabled,
      landscape,
      linkedPlayers,
      numArchives,
      onDrawingChange,
      personSharingScreen,
      propsWhenRecording,
      userID,
      videoFromCloud,
      videoPlayerRefs,
      videosBeingShared,
      preparePlayer,
      isAudioPlayerReady,
      playRecord,
      isRecording,
      clickVideo,
    } = this.props;
    const {sizeVideo, isVideoPlayerReady, displayButtonReplay} = this.state;
    if (!archive) {
      return this.viewLoader(playerStyle);
    }
    let {recordedActions} = this.props;

    if (!recordedActions) recordedActions = archive.recordedActions;

    const playerStyle = this.playerStyleByIndex(index, numArchives);
    const seekbarSize = numArchives > 1 ? 'sm' : 'lg';
 
    const {
      paused,
      currentTime,
      userIDLastUpdate,
      playRate,
      scale,
      position,
    } = videoFromCloud;
    return (
      <View style={playerStyle} onLayout={this.onLayoutContainer}>
        {isDrawingEnabled && sizeVideo.height !== 0 && (
          <DrawTools
            topVideo={index === numArchives - 1}
            landscape={landscape}
            setState={(state) => this.drawViewRef.setState(state)}
            clear={() => this.drawViewRef.clear()}
            undo={() => this.drawViewRef.undo()}
          />
        )}

        {displayButtonReplay && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={async () => {
              await this.setState({displayButtonReplay: false});
              this.previewRecording({recordedActions});
            }}
            style={styles.buttonReplayView}>
            <AllIcon
              name="undo-alt"
              type="font"
              size={45}
              color={colors.white}
            />
          </TouchableOpacity>
        )}

        <RecordingComponent
          videoPlayerRef={this.videoPlayerRef}
          archive={archive}
          onRef={(ref) => {
            this.recordingRef = ref;
          }}
          preparePlayer={preparePlayer}
          isAudioPlayerReady={isAudioPlayerReady}
          isVideoPlayerReady={isVideoPlayerReady}
          setVideoPlayerState={(state) => this.videoPlayerRef?.setState(state)}
          seekVideoPlayer={(time) => this.videoPlayerRef?.seek(time)}
          setDrawings={(drawings) => {
            this.drawViewRef.setState(drawings);
          }}
          toggleVisibleSeekBar={this.toggleVisibleSeekBar.bind(this)}
          setNewPosition={(position) =>
            this.videoPlayerRef.PinchableBoxRef.setNewPosition(position)
          }
          setNewScale={(scale) =>
            this.videoPlayerRef?.PinchableBoxRef?.setNewScale(scale)
          }
          setDisplayButtonReplay={(val) =>
            this.setState({displayButtonReplay: val})
          }
          playRecord={playRecord}
        />

        <VideoPlayer
          archiveId={id}
          disableControls={disableControls}
          seekbarSize={seekbarSize}
          width={playerStyle.width}
          index={index}
          resizeMode="contain"
          userID={userID}
          recordedActions={recordedActions}
          setSizeVideo={(size) => this.setState({sizeVideo: size})}
          pinchEnable={!isDrawingEnabled}
          isDoneBuffering={this.isDoneBuffering.bind(this)}
          onScaleChange={this.onScaleChange.bind(this)}
          onPositionChange={this.onPositionChange.bind(this)}
          componentOnTop={() => (
            <DrawView
              index={index}
              coachSessionID={coachSessionID}
              archiveID={id}
              playerStyle={playerStyle}
              videoBeingShared={videosBeingShared}
              drawingOpen={isDrawingEnabled}
              sizeVideo={sizeVideo}
              personSharingScreen={personSharingScreen}
              landscape={landscape}
              onRef={(ref) => (this.drawViewRef = ref)}
              onDrawingChange={propsWhenRecording.onDrawingChange}
              clickVideo={() => {
                this.videoPlayerRef?.visualSeekBarRef.toggleVisible();
                clickVideo(index);
              }}
            />
          )}
          isRecording={isRecording}
          noUpdateInCloud={!videosBeingShared ? true : false}
          updateOnProgress={userID === personSharingScreen}
          updateVideoInfoCloud={(dataUpdate) =>
            updateInfoVideoCloud({
              dataUpdate: dataUpdate,
              id: archive.id,
              coachSessionID,
            })
          }
          hideFullScreenButton={true}
          archive={archive}
          styleContainerVideo={{...styleApp.center, ...styleApp.fullSize}}
          linkedPlayers={[...linkedPlayers[index]].map(
            (i) => videoPlayerRefs[i],
          )}
          {...propsWhenRecording}
          onRef={(ref) => {
            this.videoPlayerRef = ref;
          }}
          paused={paused}
          playRate={playRate}
          currentTime={currentTime}
          scale={scale}
          position={position}
          userIDLastUpdate={userIDLastUpdate}
          muted={false}
          coachSessionID={coachSessionID}
          onVideoPlayerReady={(val) => this.setState({isVideoPlayerReady: val})}
          clickVideo={clickVideo}
        />
      </View>
    );
  };

  render = () => this.singlePlayer();
}

const styles = StyleSheet.create({
  buttonReplayView: {
    position: 'absolute',
    zIndex: 2,
    height: '100%',
    width: '100%',
    backgroundColor: colors.title + '40',
    ...styleApp.center,
  },
});

const mapStateToProps = (state, props) => {
  return {
    userID: state.user.userID,
    archive: props.nativeArchive
      ? props.nativeArchive
      : state.archives[props.id],
  };
};

export default connect(
  mapStateToProps,
  {archivesAction},
)(SinglePlayer);
