import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, View} from 'react-native';
import {connect} from 'react-redux';
import DrawTools from './drawing/DrawTools';
import Slider from '@react-native-community/slider';

import VideoPlayer from '../../coachFlow/VideoPlayer/index';
import styleApp from '../../../style/style';
import Loader from '../../../layout/loaders/Loader';
import colors from '../../../style/colors';
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
  singlePlayer = () => {
    const {
      archive,
      id,
      index,
      numArchives,
      userID,
      propsWhenRecording,
      isDrawingEnabled,
      disableControls,
      linkedPlayers,
      videoPlayerRefs,
      coachSessionID,
      videosBeingShared,
      personSharingScreen,
      videoFromCloud,
      landscape,
    } = this.props;
    const {sizeVideo} = this.state;

    const playerStyle = this.playerStyleByIndex(index, numArchives);
    const seekbarSize = numArchives > 1 ? 'sm' : 'lg';
    if (!archive) {
      return this.viewLoader(playerStyle);
    }
    const {paused, currentTime, userIDLastUpdate, playRate} = videoFromCloud;
    return (
      <View style={playerStyle} onLayout={this.onLayoutContainer}>
        {isDrawingEnabled && sizeVideo.height !== 0 && (
          <DrawTools
            landscape={landscape}
            setColor={(color) => this.drawViewRef.setState(color)}
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
          componentOnTop={() => (
            <DrawView
              coachSessionID={coachSessionID}
              archiveID={id}
              playerStyle={playerStyle}
              videoBeingShared={videosBeingShared}
              drawingOpen={isDrawingEnabled}
              sizeVideo={sizeVideo}
              personSharingScreen={personSharingScreen}
              landscape={landscape}
              onRef={(ref) => (this.drawViewRef = ref)}
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
