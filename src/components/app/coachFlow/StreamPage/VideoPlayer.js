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

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      paused: this.props.paused ? this.props.paused : false,
      totalTime: 0,
      currentTime: this.props.currentTime ? this.props.currentTime : 0,
      videoLoaded: false,
    };
  }
  componentDidMount() {}
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentTime !== this.props.currentTime) {
      this.player.seek(this.props.currentTime);
      this.setState({currentTime: this.props.currentTime});
    }
  }
  togglePlayPause = async () => {
    const {currentTime} = this.state;
    const {paused} = this.props;
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
  playPauseButton = () => {
    const {paused} = this.props;
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
        style={{height: 30, width: 30}}
        onPressColor={colors.off}
      />
    );
  };
  onProgress = (info) => {
    const {currentTime} = info;
    const {paused} = this.props;
    this.setState({paused: paused, currentTime: currentTime});
  };
  onSlidingStart = () => {
    const {updateVideoInfoCloud} = this.props;
    if (updateVideoInfoCloud) updateVideoInfoCloud(true);
  };
  onSlidingComplete = async (SliderTime) => {
    const {paused, updateVideoInfoCloud} = this.props;

    this.player.seek(SliderTime);
    this.setState({currentTime: SliderTime});
    if (updateVideoInfoCloud) updateVideoInfoCloud(paused, SliderTime);
  };
  controlButtons() {
    const {totalTime, currentTime} = this.state;
    // const remainingTime = totalTime.toPrecision(1) - currentTime.toPrecision(1);
    return (
      <View style={styles.controlButtons}>
        <Row>
          <Col size={20} style={styleApp.center}>
            {this.playPauseButton()}
          </Col>
          <Col size={60} style={styleApp.center2}>
            <Slider
              style={styles.slideVideo}
              minimumValue={0}
              maximumValue={totalTime}
              value={currentTime}
              minimumTrackTintColor={colors.white}
              maximumTrackTintColor={colors.greyDark}
              onSlidingStart={() => this.onSlidingStart()}
              onSlidingComplete={(SliderTime) =>
                this.onSlidingComplete(SliderTime)
              }
            />
          </Col>
          <Col size={20} style={styleApp.center}>
            <Text style={[styleApp.title, {fontSize: 14, color: colors.white}]}>
              {/* -{Math.floor(remainingTime / 60)}:
              {remainingTime - Math.floor(remainingTime / 60)} */}
              {currentTime.toPrecision(2)}/
              {totalTime === 0 ? '-' : totalTime.toPrecision(2)}
            </Text>
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
      currentTime,
      paused,
      styleContainerVideo,
      styleVideo,
    } = this.props;
    const {videoLoaded} = this.state;
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
        {this.controlButtons()}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  controlButtons: {
    position: 'absolute',
    height: 65,
    width: width,
    bottom: 25,
    backgroundColor: colors.grey,
  },
  slideVideo: {width: '90%', height: 40},
  bufferView: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    ...styleApp.center,
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
