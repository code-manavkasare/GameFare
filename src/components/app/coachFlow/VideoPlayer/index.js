import React, {Component} from 'react';
import {View, Animated, Image, Dimensions} from 'react-native';
import Video from 'gamefare-rn-video';
import PropTypes from 'prop-types';
import AudioSession from 'react-native-audio-session';

import AsyncImage from '../../../layout/image/AsyncImage';
import Loader from '../../../layout/loaders/Loader';
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
    heightControlBar: PropTypes.number,
    sizeControlButton: PropTypes.string,
    hideFullScreenButton: PropTypes.bool,
    noUpdateInCloud: PropTypes.bool,

    buttonTopRight: PropTypes.func,
    placeHolderImg: PropTypes.string,

    onRef: PropTypes.func.isRequired,
    onPlayPause: PropTypes.func,
    onCurrentTimeChange: PropTypes.func,
    onPlayRateChange: PropTypes.func,
    onScaleChange: PropTypes.func,
    onPositionChange: PropTypes.func,

    linkedPlayers: PropTypes.array,
  };
  static defaultProps = {
    onPlayPause: (i, paused, currentTime) => null,
    onSlidingStart: (i, currentTime, paused) => null,
    onCurrentTimeChange: (i, SliderTime, paused) => null,
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
      muted: false,
      allowRecording: false,
      slidingStartTime: null,
      error: false,
      audioSession: false,
    };
    this.opacityControlBar = new Animated.Value(1);
  }
  async componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    const {currentTime} = this.state;
    const {coachSessionID} = this.props;
    if (currentTime !== 0) {
      this.seek(currentTime);
    }

    const connectedToSession =
      coachSessionID !== false && coachSessionID !== undefined;
    if (connectedToSession) {
      AudioSession.setCategoryAndMode(
        'PlayAndRecord',
        'VideoChat',
        'AllowBluetooth',
      );
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const {currentTime, videoLoaded, seekbarLoaded} = this.state;

    if (prevState.currentTime !== currentTime) {
      this.visualSeekBarRef?.setCurrentTime(currentTime, true);
      this.seek(currentTime);
      // this.visualSeekBarRef.toggleVisible(true);
      this.PinchableBoxRef?.resetPosition();
    }

    if (videoLoaded && !prevState.videoLoaded) {
      setTimeout(() => {
        // this.visualSeekBarRef?.toggleVisible(true);
        this.seek(currentTime);
      }, 200);
    }
  }

  getProxySource = async (src) => {
    const proxySource = await convertToProxyURL(src);
    this.setState({proxySource});
  };
  setDrawings = (drawings) => {
    this.drawViewRef.setState({drawings});
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
    this.player?.seek(time ? time : 0, 0);
  };
  seekDiff = async (diffTime) => {
    const {currentTime} = this.state;
    this.player?.seek(currentTime + diffTime, 0);
  };
  togglePlayPause = async (forcePause) => {
    let {paused, playRate} = this.state;
    const {
      onPlayPause,
      onCurrentTimeChange,
      index,
      noUpdateInCloud,
      updateVideoInfoCloud,
      archive,
    } = this.props;
    const {durationSeconds} = archive;
    const currentTime = this.visualSeekBarRef?.getCurrentTime();
    if (forcePause) {
      paused = false;
    }
    if (durationSeconds - currentTime < 0.05 && paused) {
      await this.onSeek(0);
      this.setState({paused: false});
      await onCurrentTimeChange(index, 0, false);
      onPlayPause(index, !paused, 0);
    } else if (!noUpdateInCloud) {
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
    const {isDoneBuffering} = this.props;
    const {videoLoading} = this.state;
    this.setState({videoLoading: event.isBuffering});
    if (
      isDoneBuffering &&
      !event.isBuffering &&
      event.isBuffering !== videoLoading
    ) {
      isDoneBuffering();
    }
  };
  onProgress = async (info) => {
    const paused = this.visualSeekBarRef?.getPaused();
    const {currentTime} = info;
    if (!paused) {
      this.visualSeekBarRef?.setCurrentTime(currentTime);
    }
    this.adjustAudioSession();
  };
  adjustAudioSession() {
    const {coachSessionID} = this.props;
    const {audioSession} = this.state;
    if (audioSession) return;
    const connectedToSession =
      coachSessionID !== false && coachSessionID !== undefined;
    if (connectedToSession) {
      this.setState({audioSession: 'opentokConfig'});
      return new Promise((resolve, reject) => {
        AudioSession.setCategoryAndMode(
          'PlayAndRecord',
          'VideoChat',
          'AllowBluetooth',
        )
          .then(() => {
            return resolve();
          })
          .catch(() => {
            return reject();
          });
      });
    }
    return null;
  }
  onSlidingComplete = async (sliderTime, forcePlay) => {
    const {prevPaused} = this.state;
    const {
      updateVideoInfoCloud,
      noUpdateInCloud,
      index,
      onCurrentTimeChange,
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
    onCurrentTimeChange(index, sliderTime, paused);
    return true;
  };
  linkedOnSlidingComplete = async (sliderTime, forcePlay) => {
    const {linkedPlayers} = this.props;
    const {slidingStartTime} = this.state;
    this.onSlidingComplete(sliderTime, forcePlay);
    linkedPlayers?.forEach((playerRef) => {
      playerRef.seekDiff(sliderTime - slidingStartTime);
    });
  };
  linkedOnSlidingStart = async () => {
    const {linkedPlayers} = this.props;
    this.onSlidingStart();
    linkedPlayers?.forEach((playerRef) => {
      playerRef.videoPlayerRef.onSlidingStart();
    });
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
    if (onSlidingStart) onSlidingStart(index, currentTime, paused);
    if (updateVideoInfoCloud && !noUpdateInCloud) {
      await updateVideoInfoCloud({paused: true});
    }
    return this.setState({paused: true, slidingStartTime: currentTime});
  };
  onSeek = async (time, fineSeek) => {
    const {
      index,
      onPlayPause,
      updateVideoInfoCloud,
      noUpdateInCloud,
      onSeek,
    } = this.props;
    const {paused, prevPaused, currentTime} = this.state;

    if (!paused) {
      await this.setState({paused: true, prevPaused: false});
    } else if (prevPaused === undefined) {
      this.setState({prevPaused: true});
    }
    if (fineSeek) {
      this.setState({prevPaused: undefined});
      onPlayPause(index, true, time);
      this.linkedTogglePlayPause(true);
      if (updateVideoInfoCloud && !noUpdateInCloud) {
        await updateVideoInfoCloud({
          currentTime: time,
          paused: true,
        });
      }
    }
    this.player.seek(time, 33);
    if (onSeek) {
      onSeek(currentTime, time);
    }
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
        ]}
        pointerEvents="none">
        <Loader size={60} color={colors.white} />
      </View>
    );
  }
  clickVideo(index) {
    const {clickVideo} = this.props;
    Animated.timing(
      this.opacityControlBar,
      timing(this.opacityControlBar._value ? 0 : 1, 200),
    ).start();
    this.visualSeekBarRef?.toggleVisible();
    if (clickVideo) {
      clickVideo(index);
    }
  }
  setXOffset(x) {
    this.visualSeekBarRef?.setXOffset(x);
  }
  setRecording(allowRecording) {
    this.setState({allowRecording});
  }
  render() {
    const {
      archiveId,
      onScaleChange,
      onPositionChange,
      styleContainerVideo,
      componentOnTop,
      buttonTopRight,
      index,
      setScale,
      width,
      seekbarSize,
      disableControls,
      pinchEnable,
      archive,
      scale,
      position,
      isRecording,
      coachSessionID,
    } = this.props;
    let {recordedActions} = this.props;

    let {thumbnail, url, durationSeconds, originalUrl} = archive;
    if (originalUrl?.substr(originalUrl.length - 4) !== '.mp4') {
      originalUrl = originalUrl + '.mp4';
    }

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
      allowRecording,
      error,
    } = this.state;
    if (error) url = originalUrl;
    const {height} = Dimensions.get('screen');
    const connectedToSession =
      coachSessionID !== false && coachSessionID !== undefined;

    return (
      <Animated.View style={[styleContainerVideo, {overflow: 'hidden'}]}>
        {buttonTopRight && buttonTopRight()}

        <View
          style={[
            styleApp.fullSize,
            styleApp.center,
            {backgroundColor: colors.black},
          ]}>
          {videoLoading && this.fullScreenLoader()}
          {!videoLoaded && thumbnail && (
            <AsyncImage
              resizeMode={'contain'}
              style={[
                {
                  position: 'absolute',
                  zIndex: -1,
                  height,
                  width,
                },
              ]}
              mainImage={thumbnail}
              pointerEvents={'none'}
            />
          )}

          <PinchableBox
            styleContainer={[styleApp.fullSize, styleApp.center]}
            onRef={(ref) => (this.PinchableBoxRef = ref)}
            pinchEnable={pinchEnable}
            scale={scale}
            position={position}
            scaleChange={(val) => setScale && setScale(val)}
            onPinch={(scale) => onScaleChange(index, scale)}
            onDrag={(pos) => onPositionChange(index, pos)}
            singleTouch={() => this.clickVideo(index)}
            component={() => (
              <View style={[styleApp.fullSize, styleApp.center]}>
                {url && (
                  <Video
                    key={index}
                    debug
                    mixWithOthers={connectedToSession ? undefined : 'mix'}
                    ignoreSilentSwitch={
                      connectedToSession ? undefined : 'ignore'
                    }
                    allowRecording={
                      connectedToSession ? undefined : allowRecording
                    }
                    source={{uri: error ? originalUrl : url}}
                    style={styleApp.fullSize}
                    ref={(ref) => {
                      this.player = ref;
                    }}
                    rate={playRate}
                    onError={(error) => {
                      this.setState({error: true});
                      console.log(url, error);
                    }}
                    onLoadStart={(response) => {
                      if (connectedToSession) {
                        AudioSession.setCategoryAndMode(
                          'PlayAndRecord',
                          'VideoChat',
                          'AllowBluetooth',
                        );
                      }
                    }}
                    onLoad={async (callback) => {
                      const {setSizeVideo} = this.props;
                      this.clickVideo(index);
                      if (setSizeVideo && thumbnail) {
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
                      this.linkedTogglePlayPause();
                      this.visualSeekBarRef?.setCurrentTime(
                        durationSeconds,
                        true,
                      );
                    }}
                  />
                )}

                {componentOnTop && componentOnTop()}
              </View>
            )}
          />
        </View>
        {
          <VisualSeekBar
            archiveId={archiveId}
            disableControls={disableControls}
            onRef={(ref) => (this.visualSeekBarRef = ref)}
            source={error ? originalUrl : url ? url : undefined}
            isRecording={isRecording}
            size={seekbarSize}
            togglePlayPause={this.linkedTogglePlayPause.bind(this)}
            currentTime={currentTime}
            recordedActions={recordedActions}
            totalTime={durationSeconds}
            paused={paused}
            prevPaused={prevPaused}
            updatePlayRate={(rate) => this.updatePlayRate(rate)}
            seek={this.onSeek.bind(this)}
            onSlidingComplete={(sliderTime, forcePlay) =>
              this.onSlidingComplete(sliderTime, forcePlay)
            }
            onSlidingStart={() => this.onSlidingStart()}
            width={width}
            onSeekbarLoad={() => {
              this.setState({seekbarLoaded: true});
            }}
          />
        }
      </Animated.View>
    );
  }
}
