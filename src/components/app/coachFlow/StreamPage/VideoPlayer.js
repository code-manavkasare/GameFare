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

const {height, width} = Dimensions.get('screen');

import AllIcons from '../../../layout/icons/AllIcons';
import Loader from '../../../layout/loaders/Loader';
import ButtonColor from '../../../layout/Views/Button';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

const minutes = (time) => {
  return Math.floor(time / 60);
};

const seconds = (time) => {
  const sec = (time - Math.floor(time / 60)).toFixed(0);
  if (sec.length === 1) return '0' + sec;
  return sec;
};

const displayTime = (time) => {
  return minutes(time) + ':' + seconds(time);
};

const heightControlBar = 100;

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      paused: true,
      totalTime: 0,
      currentTime: this.props.currentTime ? this.props.currentTime : 0,
      noTimeUpdate: false,
      videoLoaded: false,
      valuePauseBeforeSlide: false,
    };
  }
  componentDidMount() {}
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
    }
  }
  togglePlayPause = async () => {
    const {currentTime, paused} = this.state;
    console.log('togglePlayPause', paused);
    this.setState({noTimeUpdate: true});
    this.props.updateVideoInfoCloud &&
      this.props.updateVideoInfoCloud(!paused, currentTime);
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
    const {updateVideoInfoCloud} = this.props;
    // const {paused} = this.state;
    this.setState({paused: true});
    if (updateVideoInfoCloud) updateVideoInfoCloud(true);
  };
  onSlidingComplete = async (SliderTime) => {
    const {updateVideoInfoCloud} = this.props;
    // const {paused, valuePauseBeforeSlide} = this.state;

    this.player.seek(SliderTime);
    this.setState({currentTime: SliderTime});
    if (updateVideoInfoCloud) updateVideoInfoCloud(true, SliderTime);
  };
  playPauseButton = (paused) => {
    return (
      <ButtonColor
        view={() => {
          return (
            <AllIcons
              name={paused ? 'play' : 'pause'}
              color={colors.greyDark}
              size={20}
              type="font"
            />
          );
        }}
        // color={colors.off2}
        click={() => this.togglePlayPause()}
        style={{height: 60, width: '100%'}}
        onPressColor={colors.off}
      />
    );
  };
  controlButtons() {
    const {totalTime, currentTime, videoLoaded, paused} = this.state;
    let remainingTime = 0;
    if (totalTime !== 0)
      remainingTime = totalTime.toPrecision(2) - currentTime.toPrecision(2);

    console.log('remainingTime', totalTime);
    return (
      <View style={styles.controlButtons}>
        <Row>
          <Col size={10}>{this.playPauseButton(paused)}</Col>
          <Col size={60}>
            <Row style={{height: 45}}>
              <Slider
                style={styles.slideVideo}
                minimumValue={0}
                maximumValue={totalTime}
                value={currentTime}
                minimumTrackTintColor={colors.white}
                maximumTrackTintColor={colors.greyDark}
                onSlidingStart={() => this.onSlidingStart()}
                onValueChange={(value) => this.setState({currentTime: value})}
                onSlidingComplete={(SliderTime) =>
                  this.onSlidingComplete(SliderTime)
                }
              />
            </Row>
            <Row style={{height: 35}}>
              <Col style={styleApp.center2}>
                <Text style={styles.textTime}>{displayTime(currentTime)}</Text>
              </Col>
              <Col style={styleApp.center3}>
                {!videoLoaded ? (
                  <Loader size={17} color={'white'} />
                ) : (
                  <Text style={styles.textTime}>
                    -{displayTime(remainingTime)}
                  </Text>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </View>
    );
  }
  bufferView() {
    return (
      <View style={styles.bufferView}>
        <Loader color={'grey'} size={32} />
      </View>
    );
  }
  render() {
    const {
      source,
      styleContainerVideo,
      styleVideo,
      componentOnTop,
    } = this.props;
    const {videoLoaded, currentTime, paused} = this.state;
    console.log('render video player', paused);
    return (
      <Animated.View style={styleContainerVideo}>
        {!videoLoaded && this.bufferView()}
        <Video
          source={{uri: source}}
          style={styleVideo}
          ref={(ref) => {
            this.player = ref;
          }}
          onLoad={(callback) => {
            this.player.seek(currentTime);
            this.setState({videoLoaded: true, totalTime: callback.duration});
          }}
          progressUpdateInterval={1000}
          repeat={true}
          onBuffer={this.onBuffer} // Callback when remote video is buffering
          onError={this.videoError}
          paused={paused}
          onProgress={(info) => !paused && this.onProgress(info)}
        />
        {componentOnTop && componentOnTop()}
        {this.controlButtons()}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  controlButtons: {
    position: 'absolute',
    height: heightControlBar,
    width: width,
    bottom: 0,
    zIndex: 50,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: colors.grey,
  },
  slideVideo: {width: '100%', height: 40, marginTop: 5},
  textTime: {...styleApp.title, fontSize: 14, color: colors.white},
  bufferView: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    ...styleApp.center,
  },
  viewTimeRemain: {
    position: 'absolute',
    top: 40,
    right: 0,
  },
});

VideoPlayer.propTypes = {
  source: PropTypes.string.isRequired,
  paused: PropTypes.bool,
  currentTime: PropTypes.number,
  updateVideoInfoCloud: PropTypes.func,

  styleContainerVideo: PropTypes.object.isRequired,
  styleVideo: PropTypes.object.isRequired,
};
