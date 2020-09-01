import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, View} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {isEqual} from 'lodash';

import VideoPlayer from '../../coachFlow/VideoPlayer/index';
import styleApp from '../../../style/style';
import Loader from '../../../layout/loaders/Loader';
import colors from '../../../style/colors';
import DrawTools from './drawing/DrawTools';
import DrawView from './drawing/DrawView';
import {bindArchive} from '../../../functions/archive';
import {updateInfoVideoCloud} from '../../../functions/coach';

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
    };
  }

  componentDidMount = () => {
    this.props.onRef(this);
    const {local, id} = this.props;
    if (!local) {
      bindArchive(id);
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
  viewLoader(playerStyle) {
    return (
      <View style={[playerStyle, styleApp.center]}>
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
      const updates = {
        [`coachSessions/${coachSessionID}/sharedVideos/${id}/position/`]: position,
      };
      database()
        .ref()
        .update(updates);
    }
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
    } = this.props;
    const {sizeVideo} = this.state;

    const playerStyle = this.playerStyleByIndex(index, numArchives);
    const seekbarSize = numArchives > 1 ? 'sm' : 'lg';
    if (!archive) {
      return this.viewLoader(playerStyle);
    }
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
            landscape={landscape}
            setState={(state) => this.drawViewRef.setState(state)}
            clear={() => this.drawViewRef.clear()}
            undo={() => this.drawViewRef.undo()}
          />
        )}
        <VideoPlayer
          archiveId={id}
          disableControls={disableControls}
          seekbarSize={seekbarSize}
          width={playerStyle.width}
          index={index}
          resizeMode="contain"
          userID={userID}
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
            />
          )}
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
          styleVideo={styleApp.fullSize}
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
        />
      </View>
    );
  };

  render = () => this.singlePlayer();
}

const mapStateToProps = (state, props) => {
  return {
    userID: state.user.userID,
    archive: props.nativeArchive
      ? props.nativeArchive
      : props.local
      ? state.localVideoLibrary.videoLibrary[props.id]
      : state.archives[props.id],
  };
};

export default connect(
  mapStateToProps,
  {},
)(SinglePlayer);
