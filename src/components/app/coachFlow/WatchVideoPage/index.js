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
const {height, width} = Dimensions.get('screen');
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
    };
    this.translateXPage = new Animated.Value(0);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateYPage = new Animated.Value(height);
  }
  componentDidMount() {
    this.props.onRef(this);
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
    const {watchVideo, source, thumbnail, archiveID} = videoData;
    const {currentWidth} = this.props.currentScreenSize;
    const {videoSource} = this.state;

    if (watchVideo) {
      await this.translateXPage.setValue(0);
      if (videoSource)
        await this.setState({
          videoSource: source,
          watchVideo: true,
          thumbnail: thumbnail,
          archiveID: archiveID,
        });
    }

    Animated.parallel([
      Animated.spring(
        this.translateYPage,
        native(watchVideo ? 0 : height, 200),
      ),
    ]).start(async () => {
      if (!watchVideo) {
        this.translateXPage.setValue(currentWidth);
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
      currentScreenSize,
      coachSessionID,
      videoBeingShared,
    } = this.props;
    const {videoSource, thumbnail, archiveID} = this.state;
    const {currentWidth, currentHeight} = currentScreenSize;
    const myVideo = this.isMyVideo(this.props);
    const video = this.video(this.props, this.state);
    const drawingEnable =
      personSharingScreen && archiveID === videoBeingShared.id;

    return (
      <Animated.View
        style={[
          styles.page,
          {
            width: currentWidth,
            height: currentHeight,
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
          icon2={drawingEnable && 'pencil-ruler'}
          backgroundColorIcon2={colors.title + '70'}
          clickButton2={() => this.rightButtonsRef.openToolBox()}
          sizeIcon2={20}
          typeIcon2="font"
          colorIcon2={colors.white}
          initialTitleOpacity={1}
          clickButton1={() => {
            if (
              personSharingScreen === userID &&
              videoBeingShared.id === archiveID
            )
              return this.buttonShareRef.startSharingVideo(false);
            this.open(false);
          }}
        />

        <VideoPlayer
          source={videoSource ? videoSource : ''}
          paused={video.paused}
          playRate={video.playRate}
          index={archiveID}
          userID={userID}
          currentTime={video.currentTime}
          userIDLastUpdate={video.userIDLastUpdate}
          hideFullScreenButton={true}
          placeHolderImg={thumbnail}
          propsComponentOnTop={videoBeingShared.drawings}
          componentOnTop={() => (
            <TouchableOpacity
              style={{
                position: 'absolute',
                ...styleApp.fullSize,
                zIndex: 3,
              }}
              activeOpacity={1}
              onPress={() => this.videoPlayerRef.clickVideo()}>
              <DrawView
                coachSessionID={coachSessionID}
                archiveID={archiveID}
                videoBeingShared={videoBeingShared}
                drawings={
                  videoBeingShared?.drawings ? videoBeingShared.drawings : {}
                }
                onRef={(ref) => (this.drawViewRef = ref)}
                drawingOpen={drawingEnable}
                video={video}
              />
              <ButtonShareVideo
                onRef={(ref) => (this.buttonShareRef = ref)}
                archiveID={archiveID}
                coachSessionID={coachSessionID}
                videoBeingShared={videoBeingShared}
                source={video.source}
                personSharingScreen={personSharingScreen}
                togglePlayPause={() =>
                  this.videoPlayerRef.togglePlayPause(true)
                }
                open={this.open.bind(this)}
                getVideoState={() => this.videoPlayerRef.getState()}
              />
            </TouchableOpacity>
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
        <RightButtons
          state={this.props.state}
          archiveID={archiveID}
          onRef={(ref) => (this.rightButtonsRef = ref)}
          coachSessionID={coachSessionID}
          videoBeingShared={videoBeingShared}
          drawViewRef={this.drawViewRef}
          drawingEnable={drawingEnable}
          personSharingScreen={personSharingScreen}
          setState={this.setState.bind(this)}
          openVideo={(videoData) => this.open(videoData)}
        />
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
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(WatchVideoPage);
