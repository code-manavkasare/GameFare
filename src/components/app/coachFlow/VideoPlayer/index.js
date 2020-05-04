import React, {Component} from 'react';
import {View, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';

import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import Loader from '../../../layout/loaders/Loader';
import ButtonColor from '../../../layout/Views/Button';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {timeout} from '../../../functions/coach';
import {timing} from '../../../animations/animations';
import ControlButtons from './components/ControlButtons';

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      paused: this.props.paused,
      totalTime: 0,
      currentTime: this.props.currentTime ? this.props.currentTime : 0,
      videoLoaded: false,
      fullscreen: false,
      onSliding: false,
      playbackRate: 1,

      placeHolderImg: this.props.placeHolderImg,
      displayVideo: false,
    };
    this.opacityControlBar = new Animated.Value(1);
  }
  async componentDidMount() {
    this.props.onRef(this);
    await timeout(1000);
    this.setState({loader: false, displayVideo: true});
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.totalTime !== this.state.totalTime)
      this.player.seek(this.state.currentTime, 0);
    else if (
      prevState.currentTime + 2 < this.state.currentTime ||
      prevState.currentTime - 2 > this.state.currentTime
    )
      this.player.seek(this.state.currentTime, 0);
  }
  static getDerivedStateFromProps(props, state) {
    if (
      props.currentTime !== state.currentTime &&
      (props.currentTime + 2 < state.currentTime ||
        props.currentTime - 2 > state.currentTime) &&
      !props.noUpdateInCloud
    )
      return {
        currentTime: props.currentTime,
      };
    if (props.paused !== state.paused && !props.noUpdateInCloud) {
      return {
        paused: props.paused,
        currentTime: props.currentTime,
      };
    }
    if (props.placeHolderImg !== state.placeHolderImg)
      return {
        placeHolderImg: props.placeHolderImg,
      };
    return {};
  }
  getState() {
    return this.state;
  }
  togglePlayPause = async (forcePause) => {
    let {currentTime, paused} = this.state;
    if (forcePause) paused = false;
    const {noUpdateInCloud, updateVideoInfoCloud} = this.props;

    if (updateVideoInfoCloud && !noUpdateInCloud)
      updateVideoInfoCloud(!paused, currentTime);
    else this.setState({paused: !paused});
  };
  onBuffer = (event) => {
    this.setState({videoLoaded: !event.isBuffering});
  };
  onProgress = (info) => {
    const {onSliding} = this.state;
    const {updateOnProgress} = this.props;
    const {currentTime} = info;
    const {noUpdateInCloud, updateVideoInfoCloud} = this.props;
    this.setState({currentTime: currentTime});
    if (
      updateVideoInfoCloud &&
      !noUpdateInCloud &&
      !onSliding &&
      updateOnProgress
    )
      updateVideoInfoCloud(false, currentTime);
  };
  onSlidingComplete = async (SliderTime) => {
    const {updateVideoInfoCloud, noUpdateInCloud} = this.props;

    if (updateVideoInfoCloud && !noUpdateInCloud)
      await updateVideoInfoCloud(true, SliderTime);

    this.player.seek(SliderTime);
    this.setState({currentTime: SliderTime, onSliding: false});
  };
  onSlidingStart = async () => {
    const {updateVideoInfoCloud, noUpdateInCloud} = this.props;
    const {currentTime} = this.state;

    if (updateVideoInfoCloud && !noUpdateInCloud) {
      updateVideoInfoCloud(true, currentTime);
      await this.setState({paused: true, onSliding: true});
    } else this.setState({onSliding: true});
  };
  playPauseButton = (paused) => {
    const styleButton = {height: 45, width: '100%'};
    return (
      <ButtonColor
        view={() => {
          return (
            <AllIcons
              name={paused ? 'play' : 'pause'}
              color={colors.white}
              size={20}
              type="font"
            />
          );
        }}
        click={() => this.togglePlayPause()}
        style={styleButton}
        onPressColor={colors.off}
      />
    );
  };
  fullScreen() {
    const {fullscreen} = this.state;
    this.setState({fullscreen: !fullscreen});
  }
  fullScreenLoader() {
    return (
      <View
        style={[
          styleApp.fullSize,
          styleApp.center,
          {backgroundColor: colors.transparent},
        ]}>
        <Loader size={60} color={colors.white} />
      </View>
    );
  }
  clickVideo() {
    Animated.timing(
      this.opacityControlBar,
      timing(!this.opacityControlBar._value, 200),
    ).start();
  }
  render() {
    const {
      source,
      styleContainerVideo,
      styleVideo,
      componentOnTop,
      buttonTopRight,
      heightControlBar,
      sizeControlButton,
      hideFullScreenButton,
    } = this.props;

    const {
      currentTime,
      paused,
      fullscreen,
      playbackRate,
      placeHolderImg,
      displayVideo,
      totalTime,
      videoLoaded,
      loader,
      onSliding,
    } = this.state;
    return (
      <Animated.View style={[styleContainerVideo, {overflow: 'hidden'}]}>
        {loader && this.fullScreenLoader()}
        {buttonTopRight && buttonTopRight()}
        <AsyncImage
          style={[styleApp.fullSize, {position: 'absolute', zIndex: -2}]}
          mainImage={placeHolderImg}
        />

        <TouchableOpacity
          style={styles.viewClickOnVideo}
          activeOpacity={1}
          onPress={() => this.clickVideo()}
        />

        {displayVideo && (
          <TouchableOpacity
            style={[styleApp.fullSize, {backgroundColor: colors.grey + '00'}]}>
            <Video
              source={{uri: source}}
              style={styleVideo}
              ref={(ref) => {
                this.player = ref;
              }}
              rate={playbackRate}
              onLoad={async (callback) => {
                await this.setState({
                  totalTime: callback.duration,
                  loader: false,
                });
                this.player.seek(0);
              }}
              fullscreen={fullscreen}
              onFullscreenPlayerDidDismiss={(event) => {
                this.setState({fullscreen: false});
              }}
              progressUpdateInterval={1000}
              // repeat={true}
              onBuffer={this.onBuffer}
              paused={paused}
              onProgress={(info) => !paused && this.onProgress(info)}
            />
          </TouchableOpacity>
        )}

        {componentOnTop && componentOnTop()}

        {displayVideo && (
          <ControlButtons
            heightControlBar={heightControlBar}
            sizeControlButton={sizeControlButton}
            hideFullScreenButton={hideFullScreenButton}
            currentTime={currentTime}
            paused={paused}
            totalTime={totalTime}
            videoLoaded={videoLoaded}
            opacityControlBar={this.opacityControlBar}
            playbackRate={playbackRate}
            setState={this.setState.bind(this)}
            togglePlayPause={this.togglePlayPause.bind(this)}
            onSlidingComplete={this.onSlidingComplete.bind(this)}
            onSlidingStart={this.onSlidingStart.bind(this)}
          />
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  bufferView: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: -1,
    backgroundColor: colors.transparentGrey,
    ...styleApp.center,
  },
  viewClickOnVideo: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 2,
  },
});

VideoPlayer.propTypes = {
  source: PropTypes.string.isRequired,
  paused: PropTypes.bool,
  currentTime: PropTypes.number,
  updateVideoInfoCloud: PropTypes.func,

  styleContainerVideo: PropTypes.object.isRequired,
  styleVideo: PropTypes.object.isRequired,
  heightControlBar: PropTypes.number,
  sizeControlButton: PropTypes.string,
  hideFullScreenButton: PropTypes.bool,
  noUpdateInCloud: PropTypes.bool,

  buttonTopRight: PropTypes.func,
  placeHolderImg: PropTypes.string,

  onRef: PropTypes.func.isRequired,
};
