import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import PropTypes from 'prop-types';
import FadeInView from 'react-native-fade-in-view';

const {height, width} = Dimensions.get('screen');

import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import Loader from '../../../layout/loaders/Loader';
import ButtonColor from '../../../layout/Views/Button';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';
import {timeout, displayTime} from '../../../functions/coach';
import {timing} from '../../../animations/animations';

const {initialHeightControlBar} = sizes;

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      paused: this.props.paused,
      totalTime: 0,
      currentTime: this.props.currentTime ? this.props.currentTime : 0,
      noTimeUpdate: false,
      videoLoaded: false,
      fullscreen: false,
      valuePauseBeforeSlide: false,
      playbackRate: 1,
      showSpeedSet: false,

      placeHolderImg: this.props.placeHolderImg,

      displayButtonPlay: !this.props.autoplay,
      videoLoading: false,
      displayVideo: this.props.autoplay,
    };
    this.opacityControlBar = new Animated.Value(1);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentDidUpdate(prevProps, prevState) {
    let {currentPause, noTimeUpdate} = this.state;
    if (
      prevProps.currentTime !== this.props.currentTime &&
      prevProps.paused !== this.props.paused
    ) {
      if (!noTimeUpdate) {
        // this.player.seek(this.props.currentTime);
      }
      this.setState({
        currentTime: this.props.currentTime,
        noTimeUpdate: false,
        paused: this.props.paused,
      });
    } else if (prevProps.currentTime !== this.props.currentTime) {
      if (!noTimeUpdate) {
        this.player.seek(this.props.currentTime);
      }
      this.setState({
        currentTime: this.props.currentTime,
        noTimeUpdate: false,
      });
    } else if (prevProps.paused !== this.props.paused) {
      this.setState({paused: this.props.paused});
    } else if (prevProps.placeHolderImg !== this.props.placeHolderImg) {
      console.log('preprops video player', this.props.placeHolderImg);
      this.setState({
        placeHolderImg: this.props.placeHolderImg,
        videoLoading: true,
      });
    }
  }
  getState() {
    return this.state;
  }
  togglePlayPause = async () => {
    const {currentTime, paused} = this.state;
    const {noUpdateInCloud, updateVideoInfoCloud} = this.props;
    this.setState({noTimeUpdate: true});

    if (updateVideoInfoCloud && !noUpdateInCloud)
      updateVideoInfoCloud(!paused, currentTime);
    else this.setState({paused: !paused});
  };
  onBuffer = (event) => {
    console.log('buffer', event);
    this.setState({videoLoaded: !event.isBuffering});
  };
  videoError = () => {
    console.log('error');
  };

  onProgress = (info) => {
    const {currentTime} = info;
    this.setState({currentTime: currentTime});
  };
  onSlidingStart = () => {
    const {updateVideoInfoCloud, noUpdateInCloud} = this.props;
    // const {paused} = this.state;
    this.setState({paused: true});
    if (updateVideoInfoCloud && !noUpdateInCloud) updateVideoInfoCloud(true);
  };
  onSlidingComplete = async (SliderTime) => {
    const {updateVideoInfoCloud, noUpdateInCloud} = this.props;

    this.player.seek(SliderTime);
    this.setState({currentTime: SliderTime});
    if (updateVideoInfoCloud && !noUpdateInCloud)
      updateVideoInfoCloud(true, SliderTime);
  };
  playPauseButton = (paused) => {
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
        // color={colors.off2}
        click={() => this.togglePlayPause()}
        style={{height: 45, width: '100%'}}
        onPressColor={colors.off}
      />
    );
  };
  speedButton() {
    const {playbackRate, showSpeedSet} = this.state;
    const speeds = [
      {
        label: '0.25',
        value: 0.25,
      },
      {
        label: '0.5',
        value: 0.5,
      },
      {
        label: 'Normal',
        value: 1,
      },
      {
        label: '1.5',
        value: 1.5,
      },
      {
        label: '2',
        value: 2,
      },
    ];
    const buttonSpeed = (speed, i) => {
      return (
        <ButtonColor
          key={i}
          view={() => {
            return (
              <Text
                style={[
                  styleApp.text,
                  {
                    color:
                      playbackRate === speed.value ? colors.red : colors.white,
                  },
                ]}>
                {speed.label}
              </Text>
            );
          }}
          // color={colors.off2}
          click={() =>
            this.setState({playbackRate: speed.value, showSpeedSet: false})
          }
          style={{height: 30, width: '100%'}}
          onPressColor={colors.off}
        />
      );
    };
    return (
      <View style={styleApp.fullSize}>
        {showSpeedSet && (
          <FadeInView
            duration={250}
            style={[
              styles.viewSpeedSet,
              {height: speeds.length * 30, top: -(speeds.length * 30 + 25)},
            ]}>
            {speeds.map((speed, i) => buttonSpeed(speed, i))}
            <View style={styles.triangleSpeedView} />
          </FadeInView>
        )}
        <ButtonColor
          view={() => {
            return (
              <AllIcons
                name={'ellipsis-v'}
                color={colors.white}
                size={20}
                type="font"
              />
            );
          }}
          // color={colors.off2}
          click={() => this.setState({showSpeedSet: !showSpeedSet})}
          style={{height: 45, width: '100%'}}
          onPressColor={colors.off}
        />
      </View>
    );
  }
  fullScreen() {
    const {fullscreen} = this.state;
    this.setState({fullscreen: !fullscreen});
  }
  controlButtons() {
    const {
      totalTime,
      currentTime,
      videoLoaded,
      paused,
      displayButtonPlay,
    } = this.state;
    let remainingTime = 0;

    if (totalTime !== 0)
      remainingTime = totalTime.toPrecision(2) - currentTime.toPrecision(2);
    let {
      heightControlBar,
      sizeControlButton,
      hideFullScreenButton,
    } = this.props;
    if (!heightControlBar) heightControlBar = initialHeightControlBar;

    if (displayButtonPlay) return null;
    return (
      <Animated.View
        style={[
          styles.controlButtons,
          {
            height: heightControlBar,
            backgroundColor: colors.transparentGrey,
            opacity: this.opacityControlBar,
          },
        ]}>
        <Row>
          <Col size={10}>{this.playPauseButton(paused)}</Col>
          {sizeControlButton === 'sm' && (
            <Col size={15} style={styleApp.center}>
              <Text style={styles.textTime}>{displayTime(currentTime)}</Text>
            </Col>
          )}
          <Col size={60}>
            <Row style={{height: 45}}>
              <Slider
                style={styles.slideVideo}
                minimumValue={0}
                maximumValue={totalTime}
                value={currentTime}
                minimumTrackTintColor={colors.white}
                maximumTrackTintColor={colors.greyDark + '50'}
                onSlidingStart={() => this.onSlidingStart()}
                onValueChange={(value) => this.setState({currentTime: value})}
                onSlidingComplete={(SliderTime) =>
                  this.onSlidingComplete(SliderTime)
                }
              />
            </Row>
            {sizeControlButton !== 'sm' && (
              <Row style={{height: 15, marginTop: -5}}>
                <Col style={styleApp.center2}>
                  <Text style={styles.textTime}>
                    {displayTime(currentTime)}
                  </Text>
                </Col>
                <Col style={styleApp.center3}>
                  {videoLoaded && (
                    <Text style={styles.textTime}>
                      {displayTime(totalTime)}
                    </Text>
                  )}
                </Col>
              </Row>
            )}
          </Col>
          {!hideFullScreenButton && (
            <Col
              size={10}
              style={styleApp.center3}
              onPress={() => this.fullScreen()}
              activeOpacity={1}>
              <AllIcons
                name="compress"
                type="font"
                size={20}
                color={colors.white}
              />
            </Col>
          )}
          {sizeControlButton !== 'sm' && (
            <Col size={10}>{this.speedButton()}</Col>
          )}
        </Row>
      </Animated.View>
    );
  }
  initialButtonButtonPlay() {
    const {displayButtonPlay} = this.state;
    if (!displayButtonPlay) return null;
    return (
      <ButtonColor
        view={() => {
          return (
            <AllIcons
              name="play-circle"
              type="font"
              size={40}
              color={colors.white}
            />
          );
        }}
        color={colors.grey + '40'}
        click={async () => this.clickInitialButtonPlay()}
        style={{position: 'absolute', zIndex: 6, ...styleApp.fullSize}}
        onPressColor={'transparent'}
      />
    );
  }
  async clickInitialButtonPlay() {
    await this.setState({
      videoLoading: true,
      displayButtonPlay: false,
    });
    await timeout(1000);
    this.setState({
      displayVideo: true,
    });
  }
  bufferView() {
    return (
      <View style={styles.bufferView}>
        <Loader color={'white'} size={32} />
      </View>
    );
  }
  clickVideo() {
    console.log('click video !', this.opacityControlBar);
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
    } = this.props;

    const {
      videoLoading,
      currentTime,
      paused,
      fullscreen,
      playbackRate,
      placeHolderImg,
      displayVideo,
    } = this.state;
    return (
      <Animated.View style={[styleContainerVideo, {overflow: 'hidden'}]}>
        {buttonTopRight && buttonTopRight()}
        <AsyncImage
          style={[styleApp.fullSize, {position: 'absolute', zIndex: -2}]}
          mainImage={placeHolderImg}
        />

        <TouchableOpacity
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: 2,
          }}
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
              // resizeMode={'cover'}
              rate={playbackRate}
              onLoad={async (callback) => {
                await this.setState({
                  totalTime: callback.duration,
                  displayButtonPlay: false,
                  // videoLoading: false,
                });
                this.player.seek(currentTime);
              }}
              fullscreen={fullscreen}
              onFullscreenPlayerDidDismiss={(event) => {
                console.log(event);
                this.setState({fullscreen: false});
              }}
              onError={(error) => {
                console.log('error', error);
                console.log('source', source);
              }}
              progressUpdateInterval={1000}
              repeat={true}
              onBuffer={this.onBuffer} // Callback when remote video is buffering
              paused={paused}
              onProgress={(info) => !paused && this.onProgress(info)}
            />
          </TouchableOpacity>
        )}
        {videoLoading && this.bufferView()}
        {this.initialButtonButtonPlay()}
        {componentOnTop && componentOnTop()}
        {this.controlButtons()}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  controlButtons: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 50,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    backgroundColor: colors.grey,
  },
  slideVideo: {width: '100%', height: 40, marginTop: 0},
  textTime: {...styleApp.title, fontSize: 14, color: colors.white},
  bufferView: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: -1,
    backgroundColor: colors.transparentGrey,
    ...styleApp.center,
  },
  viewTimeRemain: {
    position: 'absolute',
    top: 40,
    right: 0,
  },
  viewSpeedSet: {
    position: 'absolute',
    width: 65,
    right: 0,
    zIndex: 60,
    backgroundColor: colors.transparentGrey,
    borderRadius: 5,
    paddingTop: 5,
    paddingBottom: 5,
    ...styleApp.center,
    //overflow: 'hidden',
  },
  triangleSpeedView: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 12,
    // borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.transparentGrey,
    position: 'absolute',
    bottom: -12,
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
  autoplay: PropTypes.bool.isRequired,
  placeHolderImg: PropTypes.string,

  onRef: PropTypes.func.isRequired,
};
