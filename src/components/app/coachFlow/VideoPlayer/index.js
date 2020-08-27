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
import convertToProxyURL from 'react-native-video-cache';

export default class VideoPlayer extends Component {
  static propTypes = {
    archive: PropTypes.object.isRequired,
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

      paused: this.props.paused ? this.props.paused : false,
      prevPaused: undefined,

      currentTime: this.props.currentTime ? this.props.currentTime : 0,

      videoLoading: true,
      videoLoaded: false,
      seekbarLoaded: false,
      fullscreen: false,
      playRate: 1,
      muted: __DEV__ ? true : false,

      slidingStartTime: null,
    };
    this.opacityControlBar = new Animated.Value(1);
  }
  async componentDidMount() {
    this.props.onRef(this);
    const {currentTime} = this.state;
    if (currentTime !== 0) {
      this.seek(currentTime);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const {currentTime, videoLoaded, seekbarLoaded} = this.state;

    if (prevState.currentTime !== currentTime) {
      this.visualSeekBarRef?.setCurrentTime(currentTime, true);
      this.seek(currentTime);
      this.visualSeekBarRef.toggleVisible(true);
      this.PinchableBoxRef?.resetPosition();
    }

    if (
      videoLoaded &&
      seekbarLoaded &&
      (!prevState.videoLoaded || !prevState.seekbarLoaded)
    ) {
      setTimeout(() => {
        this.visualSeekBarRef?.toggleVisible(true);
        this.seek(currentTime);
        this.setState({paused: false});
      }, 200);
    }
  }

  getProxySource = async (src) => {
    const proxySource = await convertToProxyURL(src);
    this.setState({proxySource});
  };

  static getDerivedStateFromProps(props, state) {
    let newState = {};
    if (
      !props.noUpdateInCloud &&
      (props.paused !== state.paused ||
        props.playRate !== state.playRate ||
        props.currentTime !== state.currentTime)
    ) {
      newState = {
        ...newState,
        paused: props.paused,
        playRate: props.playRate,
        currentTime: props.currentTime,
      };
    }
    if (props.seekbarSize === 'sm') {
      newState = {
        ...newState,
        seekbarLoaded: true,
      };
    }
    return newState;
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
  seekDiff = async (diffTime) => {
    const {currentTime} = this.state;
    this.player.seek(currentTime + diffTime, 33);
  };
  togglePlayPause = async (forcePause) => {
    let {paused, playRate} = this.state;
    const {
      onPlayPause,
      index,
      noUpdateInCloud,
      updateVideoInfoCloud,
    } = this.props;
    const currentTime = this.visualSeekBarRef?.getCurrentTime();
    if (forcePause) {
      paused = false;
    }
    if (!noUpdateInCloud) {
      if (!paused) {
        return updateVideoInfoCloud({paused: true, currentTime, playRate});
      }
      return updateVideoInfoCloud({paused: false});
    } else {
      this.setState({paused: !paused});
      onPlayPause(index, !paused, currentTime);
    }
  };
  linkedTogglePlayPause = async (forcePause) => {
    const {linkedPlayers} = this.props;
    this.togglePlayPause(forcePause);
    linkedPlayers?.forEach((playerRef) =>
      playerRef.togglePlayPause(forcePause),
    );
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
    this.setState({videoLoading: event.isBuffering});
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
  linkedOnSlidingComplete = async (sliderTime, forcePlay) => {
    const {linkedPlayers} = this.props;
    const {slidingStartTime} = this.state;
    this.onSlidingComplete(sliderTime, forcePlay);
    linkedPlayers?.forEach((playerRef) =>
      playerRef.seekDiff(sliderTime - slidingStartTime),
    );
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
    return this.setState({paused: true, slidingStartTime: currentTime});
  };
  onSeek = async (time, fineSeek) => {
    const {onSeek} = this.props;
    const {paused, prevPaused, currentTime} = this.state;
    if (!paused) {
      await this.setState({paused: true, prevPaused: false});
    } else if (prevPaused === undefined) {
      this.setState({prevPaused: true});
    }
    if (fineSeek) {
      this.setState({prevPaused: undefined});
    }
    this.player.seek(time, 33);
    if (onSeek) onSeek(currentTime, time);
  };
  linkedOnSeek = async (time, fineSeek) => {
    const {linkedPlayers} = this.props;
    const {currentTime} = this.state;
    linkedPlayers?.forEach((playerRef) =>
      playerRef.seekDiff(time - currentTime),
    );
    this.onSeek(time, fineSeek);
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
          {
            backgroundColor: colors.transparent,
            position: 'absolute',
            zIndex: 40,
          },
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
  setXOffset(x) {
    this.visualSeekBarRef?.setXOffset(x);
  }
  render() {
    const {
      archiveId,
      onScaleChange,
      onPositionChange,
      styleContainerVideo,
      styleVideo,
      componentOnTop,
      buttonTopRight,
      index,
      setScale,
      width,
      seekbarSize,
      disableControls,
      pinchEnable,
      archive,
    } = this.props;

    const {thumbnail, url, durationSeconds} = archive;

    const {
      currentTime,
      paused,
      prevPaused,
      fullscreen,
      playRate,
      videoLoading,
      muted,
      videoLoaded,
      seekbarLoaded,
    } = this.state;
    return (
      <Animated.View style={[styleContainerVideo, {overflow: 'hidden'}]}>
        {buttonTopRight && buttonTopRight()}

        <View
          style={[
            styleApp.fullSize,
            styleApp.center,
            {backgroundColor: colors.black},
          ]}>
          {(videoLoading || !seekbarLoaded) && this.fullScreenLoader()}
          {!videoLoaded ||
            (!seekbarLoaded && (
              <AsyncImage
                resizeMode={'contain'}
                style={[styleApp.fullSize, {position: 'absolute', zIndex: -2}]}
                mainImage={thumbnail}
              />
            ))}
          <PinchableBox
            styleContainer={[styleApp.fullSize, styleApp.center]}
            onRef={(ref) => (this.PinchableBoxRef = ref)}
            pinchEnable={pinchEnable}
            scaleChange={(val) => setScale && setScale(val)}
            onPinch={(scale) => onScaleChange(index, scale)}
            onDrag={(pos) => onPositionChange(index, pos)}
            singleTouch={() => this.clickVideo()}
            component={() => (
              <View style={[styleApp.fullSize, styleApp.center]}>
                <Video
                  key={index}
                  source={{uri: url}}
                  style={styleApp.fullSize}
                  ref={(ref) => {
                    this.player = ref;
                  }}
                  rate={playRate}
                  onLoad={async (callback) => {
                    const {setSizeVideo} = this.props;
                    if (setSizeVideo) {
                      Image.getSize(
                        thumbnail,
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
                      videoLoaded: true,
                      paused: true,
                    });
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
                    this.visualSeekBarRef?.setCurrentTime(
                      durationSeconds,
                      true,
                    );
                  }}
                />

                {componentOnTop && componentOnTop()}
              </View>
            )}
          />
        </View>
        {url !== '' && (
          <VisualSeekBar
            archiveId={archiveId}
            disableControls={disableControls}
            onRef={(ref) => (this.visualSeekBarRef = ref)}
            source={url}
            size={seekbarSize}
            togglePlayPause={this.linkedTogglePlayPause.bind(this)}
            currentTime={currentTime}
            totalTime={durationSeconds}
            paused={paused}
            prevPaused={prevPaused}
            updatePlayRate={(rate) => this.updatePlayRate(rate)}
            seek={this.linkedOnSeek.bind(this)}
            onSlidingComplete={(sliderTime, forcePlay) =>
              this.linkedOnSlidingComplete(sliderTime, forcePlay)
            }
            onSlidingStart={() => this.onSlidingStart()}
            width={width}
            onSeekbarLoad={() => {
              this.setState({seekbarLoaded: true});
            }}
          />
        )}
      </Animated.View>
    );
  }
}
