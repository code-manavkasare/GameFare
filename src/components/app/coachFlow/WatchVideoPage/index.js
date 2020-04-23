import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import firebase from 'react-native-firebase';

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
      myVideo: false,
    };
    this.translateXPage = new Animated.Value(0);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateYPage = new Animated.Value(height);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  async open(videoData) {
    const {watchVideo, source, thumbnail, myVideo, archiveID} = videoData;
    const {currentWidth} = this.props.currentScreenSize;
    if (watchVideo) {
      await this.translateXPage.setValue(0);
      await this.setState({
        videoSource: source,
        watchVideo: true,
        thumbnail: thumbnail,
        myVideo: myVideo,
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
        this.setState({
          watchVideo: false,
          videoSource: false,
          thumbnail: false,
          archiveID: false,
        });
      }
    });
  }
  updateVideoInfoCloud = (paused, currentTime, archiveID) => {
    const {objectID} = this.props.session;
    firebase
      .database()
      .ref(`coachSessions/${objectID}/sharedVideos/${archiveID}`)
      .update({paused, currentTime});
  };

  watchVideoView() {
    const {
      session,
      personSharingScreen,
      userID,
      currentScreenSize,
    } = this.props;
    const {videoSource, thumbnail, myVideo, archiveID} = this.state;
    let video = {};

    const {currentWidth, currentHeight} = currentScreenSize;

    if (myVideo)
      video = {
        source: videoSource,
        paused: false,
        currentTime: 0,
      };
    else {
      if (!personSharingScreen || !archiveID) return null;
      video = {...session.sharedVideos[archiveID]};
    }
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
          backgroundColorIcon1={colors.off + '60'}
          initialBorderColorIcon={'transparent'}
          icon1="times"
          initialTitleOpacity={1}
          clickButton1={() => this.open(false)}
        />
        <RightButtons
          state={this.props.state}
          archiveID={archiveID}
          session={session}
          personSharingScreen={personSharingScreen}
          setState={this.setState.bind(this)}
          openVideo={(videoData) => this.open(videoData)}
        />

        {videoSource && (
          <VideoPlayer
            source={videoSource}
            paused={video.paused}
            currentTime={video.currentTime}
            hideFullScreenButton={true}
            placeHolderImg={thumbnail}
            autoplay={!myVideo ? true : false}
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
                  coachSessionID={session.objectID}
                  archiveID={archiveID}
                  video={video}
                  drawingOpen={personSharingScreen === userID}
                />
                <ButtonShareVideo
                  archiveID={archiveID}
                  session={session}
                  source={video.source}
                  personSharingScreen={personSharingScreen}
                  getVideoState={() => this.videoPlayerRef.getState()}
                />
              </TouchableOpacity>
            )}
            styleContainerVideo={[
              styleApp.center,
              {width: '100%', height: '100%'},
            ]}
            styleVideo={[styleApp.fullSize]}
            noUpdateInCloud={myVideo ? true : false}
            updateVideoInfoCloud={(paused, currentTime) =>
              this.updateVideoInfoCloud(paused, currentTime, archiveID)
            }
            onRef={(ref) => (this.videoPlayerRef = ref)}
          />
        )}
      </Animated.View>
    );
  }
  render() {
    return this.watchVideoView();
  }
}

const styles = StyleSheet.create({
  page: {
    height: height,
    width: width,
    position: 'absolute',
    backgroundColor: colors.greyDark,
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
