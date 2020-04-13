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
        label: '1 | 4',
        value: 0.25,
      },
      {
        label: '1 | 2',
        value: 0.5,
      },
      {
        label: '1 | 1',
        value: 1,
      },
      {
        label: '2 | 1',
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
          <FadeInView duration={250} style={styles.viewSpeedSet}>
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
    console.log('render control buttons', totalTime, currentTime);
    console.log(this.props);
    //  if (!totalTime || !currentTime) return null;
    if (totalTime !== 0)
      remainingTime = totalTime.toPrecision(2) - currentTime.toPrecision(2);
    let {
      heightControlBar,
      sizeControlButton,
      hideFullScreenButton,
    } = this.props;
    if (!heightControlBar) heightControlBar = initialHeightControlBar;
    console.log('remainingTime', totalTime);
    console.log('displayTime(totalTime)', displayTime(totalTime));
    console.log('initialHeightControlBar', initialHeightControlBar);
    if (displayButtonPlay) return null;
    return (
      <Animated.View
        style={[
          styles.controlButtons,
          {height: heightControlBar, backgroundColor: colors.transparentGrey},
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
                  {!videoLoaded ? (
                    <Loader size={17} color={'white'} />
                  ) : (
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
        color={colors.transparentGrey}
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

    console.log('render video player', paused);
    console.log('source', source);
    console.log('placeHolderImg', placeHolderImg);
    console.log('displayVideo', displayVideo);
    return (
      <Animated.View style={[styleContainerVideo, {overflow: 'hidden'}]}>
        {buttonTopRight && buttonTopRight()}
        <AsyncImage
          style={[styleApp.fullSize, {position: 'absolute', zIndex: -2}]}
          mainImage={placeHolderImg}
        />

        {displayVideo && (
          <View
            style={[
              styleApp.fullSize,
              {backgroundColor: colors.transparentGrey},
            ]}>
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
          </View>
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
    top: -147,
    height: 130,
    width: 60,
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
