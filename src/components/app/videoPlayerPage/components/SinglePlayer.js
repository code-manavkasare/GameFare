import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, View} from 'react-native';
import {connect} from 'react-redux';

import VideoPlayer from '../../coachFlow/VideoPlayer/index';
import styleApp from '../../../style/style';
import Loader from '../../../layout/loaders/Loader';
import colors from '../../../style/colors';
import {bindArchive} from '../../../functions/archive';

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
  singlePlayer = () => {
    const {
      archive,
      index,
      numArchives,
      userID,
      propsWhenRecording,
      isDrawingEnabled,
      disableControls,
      linkedPlayers,
      videoPlayerRefs,
    } = this.props;

    const playerStyle = this.playerStyleByIndex(index, numArchives);
    const seekbarSize = numArchives > 1 ? 'sm' : 'lg';
    if (!archive) {
      return this.viewLoader(playerStyle);
    }
    return (
      <View style={playerStyle}>
        <VideoPlayer
          disableControls={disableControls}
          seekbarSize={seekbarSize}
          width={playerStyle.width}
          index={index}
          resizeMode="contain"
          userID={userID}
          setSizeVideo={(sizeVideo) => {
            this.setState({sizeVideo: sizeVideo});
          }}
          pinchEnable={!isDrawingEnabled}
          // componentOnTop={() => videoBeingShared &&
          //   <DrawView
          //     coachSessionID={coachSessionID}
          //     archiveID={archiveID}
          //     videoBeingShared={videoBeingShared}
          //     drawingOpen={drawingOpen}
          //     sizeVideo={sizeVideo}

          //     onRef={(ref) => (this.drawViewRef = ref)}
          //     isMyVideo={this.isMyVideo(this.props)}
          //     video={video}
          //   />
          // }
          noUpdateInCloud={true}
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
