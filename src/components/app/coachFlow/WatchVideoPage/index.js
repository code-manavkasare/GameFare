import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
let {height, width} = Dimensions.get('screen');
height = Math.max(height, width);
import database from '@react-native-firebase/database';

import VideoPlayer from '../VideoPlayer/index';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import {native} from '../../../animations/animations';
import {coachAction} from '../../../../actions/coachActions';

import RightButtons from './components/RightButtons';
import ButtonShareVideo from './components/ButtonShareVideo';
import DrawView from './components/DrawView';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class WatchVideoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
      loader: true,
      videoSource: false,
      displayComponent: false,
      thumbnail: false,
      archiveID: false,
      sizeVideo: false,
      drawingOpen: false,
    };
    this.translateXPage = new Animated.Value(0);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateYPage = new Animated.Value(height);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.currentSessionID === nextProps.coachSessionID) return true;
    return false;
  }
  video(props, state) {
    const {sharedVideos} = props;
    const {archiveID, videoSource} = state;
    const myVideo = this.isMyVideo(props);
    if (myVideo)
      return {
        source: videoSource,
        paused: false,
        currentTime: 0,
        playRate: 1,
      };

    if (!sharedVideos) return {};
    let video = sharedVideos[archiveID];
    if (!video) return {};
    return video;
  }
  componentDidUpdate(prevProps) {
    if (!this.isMyVideo(prevProps) && this.isMyVideo(this.props))
      return this.open(false);
  }
  async open(videoData) {
    const {width} = Dimensions.get('screen');
    const {watchVideo, source, thumbnail, archiveID} = videoData;
    const {videoSource} = this.state;

    if (watchVideo) {
      await this.translateXPage.setValue(0);
      if (videoSource) {
        let closeDrawing = {};
        if (videoSource !== source) closeDrawing = {drawingOpen: false};
        await this.setState({
          videoSource: source,
          watchVideo: true,
          thumbnail: thumbnail,
          archiveID: archiveID,
          ...closeDrawing,
        });
      }
    }

    Animated.parallel([
      Animated.spring(
        this.translateYPage,
        native(watchVideo ? 0 : height, 200),
      ),
    ]).start(async () => {
      if (!watchVideo) {
        this.translateXPage.setValue(width);
        this.videoPlayerRef.togglePlayPause(true);
      }
      if (watchVideo && !videoSource) {
        await this.setState({
          videoSource: source,
          watchVideo: true,
          thumbnail: thumbnail,
          archiveID: archiveID,
        });
      }
    });
  }
  updateVideoInfoCloud = async (dataUpdate) => {
    const {coachSessionID} = this.props;
    const {archiveID} = this.state;
    let updates = {};

    for (var i in dataUpdate) {
      updates[
        `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/${i}`
      ] = dataUpdate[i];
    }
    await database()
      .ref()
      .update(updates);
    return true;
  };

  isMyVideo(props) {
    const {personSharingScreen, videoBeingShared} = props;
    const {archiveID} = this.state;
    if (!archiveID) return true;
    if (!videoBeingShared) return true;
    if (personSharingScreen && videoBeingShared.id === archiveID) return false;
    return true;
  }
  watchVideoView() {
    const {
      personSharingScreen,
      userID,
      coachSessionID,
      videoBeingShared,
    } = this.props;
    const {
      videoSource,
      thumbnail,
      archiveID,
      sizeVideo,
      drawingOpen,
    } = this.state;
    console.log('videoSource', videoSource);
    const myVideo = this.isMyVideo(this.props);
    const video = this.video(this.props, this.state);
    const drawingEnable =
      personSharingScreen && archiveID === videoBeingShared.id;
    return (
      <Animated.View
        style={[
          styles.page,
          {
            width: '100%',
            height: '100%',
            transform: [
              {translateX: this.translateXPage},
              {translateY: this.translateYPage},
            ],
          },
        ]}>
        <HeaderBackButton
          inputRange={[5, 10]}
          colorLoader={'white'}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          colorIcon1={colors.white}
          sizeLoader={40}
          sizeIcon1={21}
          nobackgroundColorIcon1={true}
          backgroundColorIcon1={colors.title + '70'}
          initialBorderColorIcon={'transparent'}
          icon1="times"
          icon2={'gesture'}
          backgroundColorIcon2={
            drawingOpen ? colors.secondary : colors.title + '70'
          }
          backgroundColorIconOffset={
            !drawingOpen ? colors.secondary : colors.title + '70'
          }
          clickButton2={() => this.setState({drawingOpen: true})}
          sizeIcon2={24}
          typeIcon2="mat"
          colorIcon2={colors.white}
          colorIconOffset={colors.white}
          initialTitleOpacity={1}
          clickButton1={() => {
            if (
              personSharingScreen === userID &&
              videoBeingShared.id === archiveID
            )
              return this.buttonShareRef.startSharingVideo(false);
            this.open(false);
          }}
          iconOffset="open-with"
          // colorIconOffset={colors.title}
          typeIconOffset="mat"
          sizeIconOffset={25}
          clickButtonOffset={() => this.setState({drawingOpen: false})}
        />

        <ButtonShareVideo
          onRef={(ref) => (this.buttonShareRef = ref)}
          archiveID={archiveID}
          coachSessionID={coachSessionID}
          videoBeingShared={videoBeingShared}
          source={video.source}
          personSharingScreen={personSharingScreen}
          togglePlayPause={() => this.videoPlayerRef.togglePlayPause(true)}
          open={this.open.bind(this)}
          getVideoState={() => this.videoPlayerRef.getState()}
        />
        <VideoPlayer
          source={videoSource ? videoSource : ''}
          paused={video.paused}
          playRate={video.playRate}
          index={archiveID}
          resizeMode="contain"
          userID={userID}
          currentTime={video.currentTime}
          userIDLastUpdate={video.userIDLastUpdate}
          setSizeVideo={(sizeVideo) => {
            this.setState({sizeVideo: sizeVideo});
          }}
          hideFullScreenButton={true}
          placeHolderImg={thumbnail ? thumbnail : ''}
          propsComponentOnTop={videoBeingShared.drawings}
          setScale={(val) => this.drawViewRef.setState({scaleDrawing: val})}
          componentOnTop={() => (
            <DrawView
              coachSessionID={coachSessionID}
              archiveID={archiveID}
              videoBeingShared={videoBeingShared}
              drawingOpen={drawingOpen}
              sizeVideo={sizeVideo}
              drawings={
                videoBeingShared?.drawings ? videoBeingShared.drawings : {}
              }
              onRef={(ref) => (this.drawViewRef = ref)}
              isMyVideo={this.isMyVideo(this.props)}
              video={video}
            />
          )}
          styleContainerVideo={{...styleApp.center, ...styleApp.fullSize}}
          styleVideo={styleApp.fullSize}
          noUpdateInCloud={myVideo}
          updateOnProgress={userID === personSharingScreen}
          updateVideoInfoCloud={(paused, currentTime, playRate) =>
            this.updateVideoInfoCloud(paused, currentTime, playRate)
          }
          onRef={(ref) => (this.videoPlayerRef = ref)}
        />

        {/* <RightButtons
          state={this.props.state}
          archiveID={archiveID}
          onRef={(ref) => (this.rightButtonsRef = ref)}
          coachSessionID={coachSessionID}
          videoBeingShared={videoBeingShared}
          drawViewRef={this.drawViewRef}
          drawingOpen={drawingOpen}
          personSharingScreen={personSharingScreen}
          setState={this.setState.bind(this)}
          openVideo={(videoData) => this.open(videoData)}
        /> */}
      </Animated.View>
    );
  }
  render() {
    return this.watchVideoView();
  }
}

const styles = StyleSheet.create({
  page: {
    position: 'absolute',
    backgroundColor: colors.title,
    zIndex: 60,
  },
  containerPinchView: {
    ...styleApp.fullSize,
    ...styleApp.center,
    backgroundColor: 'blue',
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(WatchVideoPage);
