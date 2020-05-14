import React, {Component} from 'react';
import {View, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

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
      lastValuePaused: false,
      totalTime: false,
      currentTime: this.props.currentTime ? this.props.currentTime : 0,
      videoLoaded: false,
      fullscreen: false,
      onSliding: false,
      source: this.props.source,
      playRate: 1,

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
  shouldComponentUpdate(nextProps, nextState) {
    const {source, paused, currentTime} = this.props;
    if (nextProps.source !== source) return true;
    if (nextProps.paused !== paused) return true;
    if (this.isCurrentTimeNeedsUpdate(currentTime, nextProps.currentTime))
      return true;
    if (!isEqual(this.state, nextState)) return true;
    if (!isEqual(this.props.propsComponentOnTop, nextProps.propsComponentOnTop))
      return true;
    return false;
  }
  componentDidUpdate(prevProps, prevState) {
    const {userIDLastUpdate, userID, noUpdateInCloud} = this.props;

    if (prevState.totalTime !== this.state.totalTime) {
      const currentTime = this.controlButtonRef.getCurrentTime();
      this.player.seek(currentTime, 0);
      this.controlButtonRef.setState({currentTime: currentTime});
    }
    console.log('compoent update', userIDLastUpdate, userID);
    if (!noUpdateInCloud && userIDLastUpdate !== userID) {
      const currentTime = this.controlButtonRef.getCurrentTime();
      console.log('this.props.currentTime', this.state.currentTime);
      console.log('currentTime', currentTime);
      console.log(
        'this.isCurrentTimeNeedsUpdate(currentTime, this.state.currentTime)',
        this.isCurrentTimeNeedsUpdate(currentTime, this.state.currentTime),
      );
      if (
        this.isCurrentTimeNeedsUpdate(currentTime, this.state.currentTime) &&
        !this.state.onSliding
      ) {
        console.log('seek on update from cloud');
        this.player.seek(this.props.currentTime, 0);
        this.controlButtonRef.setState({currentTime: this.props.currentTime});
      }
    }
  }
  isCurrentTimeNeedsUpdate(prev, next) {
    if (prev + 0.2 < next || prev - 0.2 > next) return true;
    return false;
  }
  static getDerivedStateFromProps(props, state) {
    if (props.source !== state.source) {
      return {
        source: props.source,
        paused: !props.myVideo ? props.paused : false,
        playRate: props.playRate,
        totalTime: false,
        placeHolderImg: props.placeHolderImg,
      };
    }
    if (
      (props.paused !== state.paused || props.playRate !== state.playRate) &&
      !props.noUpdateInCloud
      //  && props.userIDLastUpdate !== props.userID
    ) {
      console.log('on est dans ce cas la');
      return {
        paused: props.paused,
        playRate: props.playRate,
      };
    }
    if (
      props.currentTime !== state.currentTime &&
      (props.currentTime + 0.2 < state.currentTime ||
        props.currentTime - 0.2 > state.currentTime) &&
      !props.noUpdateInCloud &&
      !state.onSliding
    )
      return {
        currentTime: props.currentTime,
      };
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
    let {paused, playRate} = this.state;
    const currentTime = this.controlButtonRef.getCurrentTime();
    if (forcePause) paused = false;
    const {noUpdateInCloud, updateVideoInfoCloud} = this.props;

    if (updateVideoInfoCloud && !noUpdateInCloud)
      updateVideoInfoCloud({paused: !paused, currentTime, playRate});
    else this.setState({paused: !paused});
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
    // await timeout(250);
    const {onSliding} = this.state;
    const {updateOnProgress, paused} = this.props;
    const {currentTime} = info;
    const {noUpdateInCloud, updateVideoInfoCloud} = this.props;
    console.log('onProgress', currentTime);
    if (!onSliding) this.controlButtonRef.setState({currentTime: currentTime});
    if (!noUpdateInCloud && !onSliding && updateOnProgress && !paused)
      updateVideoInfoCloud({currentTime});
  };
  onSlidingComplete = async (SliderTime) => {
    const {updateVideoInfoCloud, noUpdateInCloud} = this.props;
    const {lastValuePaused} = this.state;
    // await timeout(60);
    console.log('onSlidingComplete', SliderTime);

    console.log('seek on slide complte');
    await this.player.seek(SliderTime);

    if (updateVideoInfoCloud && !noUpdateInCloud)
      await updateVideoInfoCloud({paused: true, currentTime: SliderTime});

    await this.setState({
      onSliding: false,
      paused: lastValuePaused,
    });
    this.controlButtonRef.setState({currentTime: SliderTime});

    return true;
  };
  onSlidingStart = async () => {
    const {updateVideoInfoCloud, noUpdateInCloud} = this.props;
    const currentTime = this.controlButtonRef.getCurrentTime();
    if (updateVideoInfoCloud && !noUpdateInCloud) {
      updateVideoInfoCloud({paused: true, currentTime});
    }
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
    } = this.state;
    console.log('render video player', source, paused);

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

        <TouchableOpacity
          style={styles.viewClickOnVideo}
          activeOpacity={1}
          onPress={() => this.clickVideo()}
        />

        {displayVideo && source !== '' && (
          <TouchableOpacity
            style={[styleApp.fullSize, {backgroundColor: colors.grey + '00'}]}>
            <Video
              key={index}
              source={{uri: source}}
              style={styleVideo}
              ref={(ref) => {
                this.player = ref;
              }}
              rate={playRate}
              onLoad={async (callback) => {
                await this.setState({
                  totalTime: callback.duration,
                  loader: false,
                });
                this.player.seek(0);
              }}
              muted={__DEV__ ? true : false}
              fullscreen={fullscreen}
              onFullscreenPlayerDidDismiss={(event) => {
                this.setState({fullscreen: false});
              }}
              progressUpdateInterval={1000}
              // repeat={true}
              onBuffer={this.onBuffer}
              paused={paused}
              onProgress={(info) =>
                !paused && !onSliding && this.onProgress(info)
              }
            />
          </TouchableOpacity>
        )}

        {componentOnTop && componentOnTop()}

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
            onSliding={onSliding}
            setState={this.setState.bind(this)}
            togglePlayPause={this.togglePlayPause.bind(this)}
            updatePlayRate={(playRate) => this.updatePlayRate(playRate)}
            onSlidingComplete={this.onSlidingComplete.bind(this)}
            onSlidingStart={this.onSlidingStart.bind(this)}
          />
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
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
