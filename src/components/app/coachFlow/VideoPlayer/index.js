import React, {Component} from 'react';
import {View, StyleSheet, Animated, Image} from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';

import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import Loader from '../../../layout/loaders/Loader';
import ButtonColor from '../../../layout/Views/Button';
import PinchableBox from '../../../layout/Views/PinchableBox';

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
      source: this.props.source,
      paused: this.props.paused,
      prevPaused: false,
      placeHolderImg: this.props.placeHolderImg,
      currentTime: this.props.currentTime ? this.props.currentTime : 0,
      totalTime: 0,
      videoLoaded: false,
      fullscreen: false,
      playRate: 1,
      muted: __DEV__,
      displayVideo: false,
    };
    this.opacityControlBar = new Animated.Value(1);
  }
  async componentDidMount() {
    this.props.onRef(this);
    const {currentTime} = this.state;
    await timeout(1000);
    this.setState({loader: false, displayVideo: true});
    if (currentTime !== 0) this.seek(currentTime);
  }

  async componentDidUpdate(prevProps, prevState) {
    const {currentTime, totalTime, source} = this.state;
    if (
      prevState.source !== source ||
      prevState.totalTime !== totalTime ||
      prevState.currentTime !== currentTime
    ) {
      this.controlButtonRef.setCurrentTime(currentTime, true);
      this.seek(currentTime);
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.source !== state.source) {
      return {
        source: props.source,
        paused: !props.myVideo ? props.paused : false,
        playRate: props.playRate,
        currentTime: 0,
        totalTime: false,
        placeHolderImg: props.placeHolderImg,
      };
    }
    if (
      !props.noUpdateInCloud &&
      (props.paused !== state.paused ||
        props.playRate !== state.playRate ||
        props.currentTime !== state.currentTime)
    ) {
      return {
        paused: props.paused,
        playRate: props.playRate,
        currentTime: props.currentTime,
      };
    }
    return {};
  }
  getState() {
    return {...this.state, currentTime: this.controlButtonRef.getCurrentTime()};
  }
  seek = (time) => {
    const player = this.player;
    player.seek(time, 0);
  };
  togglePlayPause = async (forcePause) => {
    let {paused, playRate} = this.state;
    const currentTime = this.controlButtonRef.getCurrentTime();
    if (forcePause) paused = false;
    const {noUpdateInCloud, updateVideoInfoCloud} = this.props;

    if (!noUpdateInCloud) {
      if (!paused)
        return updateVideoInfoCloud({paused: true, currentTime, playRate});
      return updateVideoInfoCloud({paused: false});
    } else this.setState({paused: !paused});
  };

  updatePlayRate = async (playRate) => {
    let {paused} = this.state;
    const currentTime = this.controlButtonRef.getCurrentTime();
    const {updateVideoInfoCloud} = this.props;
    await updateVideoInfoCloud({paused, currentTime, playRate});
  };

  onBuffer = (event) => {
    this.setState({videoLoaded: !event.isBuffering});
  };
  onProgress = async (info) => {
    const paused = this.controlButtonRef.getPaused();
    const {currentTime} = info;
    if (!paused) this.controlButtonRef.setCurrentTime(currentTime);
  };
  onSlidingComplete = async (SliderTime) => {
    const {prevPaused} = this.state;
    const {updateVideoInfoCloud, noUpdateInCloud} = this.props;
    const isCloudUpdating = updateVideoInfoCloud && !noUpdateInCloud;
    if (isCloudUpdating)
      await updateVideoInfoCloud({currentTime: SliderTime, paused: prevPaused});
    await this.setState({
      currentTime: SliderTime,
      paused: prevPaused,
    });

    return true;
  };
  onSlidingStart = async () => {
    const {paused} = this.state;
    const {updateVideoInfoCloud, noUpdateInCloud} = this.props;
    if (updateVideoInfoCloud && !noUpdateInCloud)
      return updateVideoInfoCloud({paused: true});
    return this.setState({paused: true, prevPaused: paused});
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
          {backgroundColor: colors.transparent, position: 'absolute'},
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
      styleContainerVideo,
      styleVideo,
      componentOnTop,
      buttonTopRight,
      heightControlBar,
      sizeControlButton,
      hideFullScreenButton,
      index,
    } = this.props;

    const {
      currentTime,
      paused,
      fullscreen,
      playRate,
      placeHolderImg,
      displayVideo,
      totalTime,
      videoLoaded,
      source,
      onSliding,
      muted,
    } = this.state;

    return (
      <Animated.View style={[styleContainerVideo, {overflow: 'hidden'}]}>
        {this.fullScreenLoader()}
        {buttonTopRight && buttonTopRight()}
        {placeHolderImg !== '' && !totalTime && (
          <AsyncImage
            style={[styleApp.fullSize, {position: 'absolute', zIndex: -2}]}
            mainImage={placeHolderImg}
          />
        )}

        {/* <TouchableOpacity
          style={styles.viewClickOnVideo}
          activeOpacity={1}
          onPress={() => this.clickVideo()}
        /> */}

        {((displayVideo && source !== '') || __DEV__) && (
          <View
            style={[
              styleApp.fullSize,
              styleApp.center,
              {backgroundColor: colors.grey + '00'},
            ]}>
            <PinchableBox
              styleContainer={[styleApp.fullSize, styleApp.center]}
              component={() => (
                <View style={[styleApp.fullSize, styleApp.center]}>
                  {/* <AsyncImage
                    mainImage={
                      'https://images.pexels.com/photos/4389409/pexels-photo-4389409.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
                    }
                    style={{height: '100%', width: '100%'}}
                  /> */}
                  <Video
                    key={index}
                    source={{uri: source}}
                    style={[
                      {
                        width: '100%',
                        height: '100%',
                        // aspectRatio: 0.5,
                        // backgroundColor: 'blue',
                      },
                    ]}
                    ref={(ref) => {
                      this.player = ref;
                    }}
                    rate={playRate}
                    onLoad={async (callback) => {
                      const {setSizeVideo} = this.props;
                      if (setSizeVideo)
                        Image.getSize(
                          placeHolderImg,
                          (width, height) => {
                            setSizeVideo({width, height});
                          },
                          (error) => {
                            console.error(
                              `Couldn't get the image size: ${error.message}`,
                            );
                          },
                        );

                      await this.setState({
                        totalTime: callback.duration,
                        videoLoaded: true,
                        loader: false,
                      });
                      const {currentTime} = this.state;
                      this.seek(currentTime);
                    }}
                    muted={muted}
                    fullscreen={fullscreen}
                    onFullscreenPlayerDidDismiss={(event) => {
                      this.setState({fullscreen: false});
                    }}
                    progressUpdateInterval={10}
                    onBuffer={this.onBuffer}
                    paused={paused}
                    onProgress={(info) => !paused && this.onProgress(info)}
                    onEnd={() => {
                      this.togglePlayPause(true);
                      this.controlButtonRef.setCurrentTime(totalTime, true);
                    }}
                  />
                  {componentOnTop && componentOnTop()}
                </View>
              )}
            />
          </View>
        )}

        {displayVideo && (
          <ControlButtons
            onRef={(ref) => (this.controlButtonRef = ref)}
            heightControlBar={heightControlBar}
            sizeControlButton={sizeControlButton}
            hideFullScreenButton={hideFullScreenButton}
            currentTime={currentTime}
            paused={paused}
            totalTime={totalTime}
            videoLoaded={videoLoaded}
            opacityControlBar={this.opacityControlBar}
            playRate={playRate}
            setState={this.setState.bind(this)}
            togglePlayPause={this.togglePlayPause.bind(this)}
            seek={(time) => this.player.seek(time, 0)}
            updatePlayRate={(playRate) => {
              return this.updatePlayRate(playRate);
            }}
            onSlidingComplete={this.onSlidingComplete.bind(this)}
            onSlidingStart={this.onSlidingStart.bind(this)}
          />
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({});

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
