import React, {Component} from 'react';
import {View, Animated, Image} from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';

import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import Loader from '../../../layout/loaders/Loader';
import ButtonColor from '../../../layout/Views/Button';
import PinchableBox from '../../../layout/Views/PinchableBox';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {timing} from '../../../animations/animations';
import VisualSeekBar from './components/VisualSeekbar';

export default class VideoPlayer extends Component {
  static propTypes = {
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
    onPlayPause: PropTypes.func,
    onSlidingEnd: PropTypes.func,
    onPlayRateChange: PropTypes.func,
    onScaleChange: PropTypes.func,
    onPositionChange: PropTypes.func,

    linkedPlayers: PropTypes.array,
  };
  static defaultProps = {
    onPlayPause: (i, paused, currentTime) => null,
    onSlidingStart: (i, currentTime, paused) => null,
    onSlidingEnd: (i, SliderTime, paused) => null,
    onPlayRateChange: (i, playrate, currentTime, paused) => null,
    onPositionChange: (i, position) => null,
    onScaleChange: (i, scale) => null,
  };
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      source: this.props.source,
      paused: this.props.paused,
      prevPaused: undefined,
      placeHolderImg: this.props.placeHolderImg,
      currentTime: this.props.currentTime ? this.props.currentTime : 0,
      totalTime: 0,
      videoLoaded: false,
      fullscreen: false,
      playRate: 1,
      muted: __DEV__ ? true : false,
      displayVideo: false,
    };
    this.opacityControlBar = new Animated.Value(1);
  }
  async componentDidMount() {
    this.props.onRef(this);
    const {currentTime} = this.state;
    this.setState({displayVideo: true});
    if (currentTime !== 0) {
      this.seek(currentTime);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const {currentTime, totalTime, source} = this.state;

    if (
      prevState.source !== source ||
      prevState.totalTime !== totalTime ||
      prevState.currentTime !== currentTime
    ) {
      this.visualSeekBarRef?.setCurrentTime(currentTime, true);
      this.seek(currentTime);
      this.visualSeekBarRef.toggleVisible(true);
    }

    if (prevState.source !== source) {
      this.PinchableBoxRef?.resetPosition();
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.source !== state.source) {
      return {
        source: props.source,
        paused: !props.myVideo ? props.paused : false,
        playRate: props.playRate,
        currentTime: 0,
        loader: true,
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
    return {
      ...this.state,
      currentTime: this.visualSeekBarRef?.getCurrentTime(),
    };
  }
  seek = (time) => {
    const player = this.player;
    player.seek(time, 0);
  };
  togglePlayPause = async (forcePause) => {
    let {paused, playRate} = this.state;
    const {
      onPlayPause,
      index,
      linkedPlayers,
      noUpdateInCloud,
      updateVideoInfoCloud,
    } = this.props;
    const currentTime = this.visualSeekBarRef?.getCurrentTime();
    if (forcePause) {
      paused = false;
    }
    linkedPlayers?.forEach((playerRef) => playerRef.togglePlayPause(forcePause));
    if (!noUpdateInCloud) {
      if (!paused) {
        return updateVideoInfoCloud({paused: true, currentTime, playRate});
      }
      return updateVideoInfoCloud({paused: false});
    } else {
      this.setState({paused: !paused});
      console.log('onPlayPause paused: ', !paused);
      onPlayPause(index, !paused, currentTime);
    }
  };

  updatePlayRate = async (playRate) => {
    let {paused} = this.state;
    const currentTime = this.visualSeekBarRef?.getCurrentTime();
    const {
      noUpdateInCloud,
      updateVideoInfoCloud,
      onPlayRateChange,
      index,
    } = this.props;
    onPlayRateChange(index, playRate, currentTime, paused);
    if (!noUpdateInCloud) {
      await updateVideoInfoCloud({paused, currentTime, playRate});
    }
    this.setState({playRate});
  };

  onBuffer = (event) => {
    this.setState({videoLoaded: !event.isBuffering});
  };
  onProgress = async (info) => {
    const paused = this.visualSeekBarRef?.getPaused();
    const {currentTime} = info;
    if (!paused) {
      this.visualSeekBarRef?.setCurrentTime(currentTime);
    }
  };
  onSlidingComplete = async (sliderTime, forcePlay) => {
    const {prevPaused} = this.state;
    const {
      updateVideoInfoCloud,
      noUpdateInCloud,
      onSlidingEnd,
      index,
    } = this.props;
    const isCloudUpdating = updateVideoInfoCloud && !noUpdateInCloud;
    if (isCloudUpdating) {
      await updateVideoInfoCloud({
        currentTime: sliderTime,
        paused: forcePlay ? forcePlay : prevPaused,
      });
    }
    const paused = forcePlay ? forcePlay : !prevPaused ? false : true;
    await this.setState({
      currentTime: sliderTime,
      paused,
      prevPaused: undefined,
    });

    onSlidingEnd(index, sliderTime, paused);
    return true;
  };
  onSlidingStart = async () => {
    const {
      onSlidingStart,
      updateVideoInfoCloud,
      noUpdateInCloud,
      index,
    } = this.props;
    const {paused} = this.state;
    const currentTime = this.visualSeekBarRef?.getCurrentTime();

    onSlidingStart(index, currentTime, paused);
    if (updateVideoInfoCloud && !noUpdateInCloud) {
      await updateVideoInfoCloud({paused: true});
    }
    return this.setState({paused: true});
  };
  onSeek = async (time, fineSeek) => {
    const {paused, prevPaused} = this.state;
    if (!paused) {
      await this.setState({paused: true, prevPaused: false});
    } else if (prevPaused === undefined) {
      this.setState({prevPaused: true});
    }
    if (fineSeek) {
      this.setState({prevPaused: undefined});
    }
    this.player.seek(time, 33);
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
      timing(this.opacityControlBar._value ? 0 : 1, 200),
    ).start();
    this.visualSeekBarRef?.toggleVisible();
  }
  render() {
    const {
      onScaleChange,
      onPositionChange,
      styleContainerVideo,
      styleVideo,
      componentOnTop,
      buttonTopRight,
      heightControlBar,
      sizeControlButton,
      hideFullScreenButton,
      index,
      setScale,
      width,
      seekbarSize,
      disableControls,
    } = this.props;

    const {
      currentTime,
      paused,
      prevPaused,
      fullscreen,
      playRate,
      placeHolderImg,
      displayVideo,
      totalTime,
      videoLoaded,
      source,
      loader,
      muted,
    } = this.state;
    console.log('paused: ', paused);
    return (
      <Animated.View style={[styleContainerVideo, {overflow: 'hidden'}]}>
        {loader && this.fullScreenLoader()}
        {buttonTopRight && buttonTopRight()}
        {placeHolderImg !== '' && !totalTime && (
          <AsyncImage
            style={[styleApp.fullSize, {position: 'absolute', zIndex: -2}]}
            mainImage={placeHolderImg}
          />
        )}

        {((displayVideo && source !== '') || __DEV__) && (
          <View
            style={[
              styleApp.fullSize,
              styleApp.center,
              {backgroundColor: colors.black},
            ]}>
            <PinchableBox
              styleContainer={[styleApp.fullSize, styleApp.center]}
              onRef={(ref) => (this.PinchableBoxRef = ref)}
              scaleChange={(val) => setScale && setScale(val)}
              onPinch={(scale) => onScaleChange(index, scale)}
              onDrag={(pos) => onPositionChange(index, pos)}
              singleTouch={() => this.clickVideo()}
              component={() => (
                <View style={[styleApp.fullSize, styleApp.center]}>
                  {source !== '' && (
                    <Video
                      key={index}
                      source={{uri: source}}
                      style={[
                        {
                          width: '100%',
                          height: '100%',
                        },
                      ]}
                      ref={(ref) => {
                        this.player = ref;
                      }}
                      rate={playRate}
                      onLoad={async (callback) => {
                        const {setSizeVideo} = this.props;
                        if (setSizeVideo) {
                          Image.getSize(
                            placeHolderImg,
                            (width, height) => {
                              setSizeVideo({width, height});
                            },
                            (error) => {
                              console.log(
                                `Couldn't get the image size: ${error.message}`,
                              );
                            },
                          );
                        }
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
                      progressUpdateInterval={30}
                      onBuffer={this.onBuffer}
                      paused={paused}
                      onProgress={(info) => !paused && this.onProgress(info)}
                      onEnd={(callback) => {
                        this.togglePlayPause(true);
                        this.visualSeekBarRef?.setCurrentTime(totalTime, true);
                      }}
                    />
                  )}
                  {componentOnTop && componentOnTop()}
                </View>
              )}
            />
          </View>
        )}

        {displayVideo && (
          <VisualSeekBar
            disableControls={disableControls}
            onRef={(ref) => (this.visualSeekBarRef = ref)}
            size={seekbarSize}
            togglePlayPause={this.togglePlayPause.bind(this)}
            currentTime={currentTime}
            totalTime={totalTime}
            paused={paused}
            prevPaused={prevPaused}
            updatePlayRate={(rate) => this.updatePlayRate(rate)}
            seek={this.onSeek.bind(this)}
            onSlidingComplete={(sliderTime, forcePlay) =>
              this.onSlidingComplete(sliderTime, forcePlay)
            }
            onSlidingStart={() => this.onSlidingStart()}
            width={width}
          />
        )}
      </Animated.View>
    );
  }
}
