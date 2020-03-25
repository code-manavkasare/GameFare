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
      paused: false,
      totalTime: 0,
      currentTime: 0,
      videoLoaded: false,
    };
  }
  componentDidMount() {}

  togglePlayPause = async () => {
    const {currentTime, paused} = this.props.sharedVideo;
    this.props.updateVideoInfoCloud &&
      this.props.updateVideoInfoCloud(!paused, currentTime);
  };
  onBuffer = () => {
    console.log('buffer');
  };
  videoError = () => {
    console.log('error');
  };
  playPauseButton = () => {
    const {paused} = this.props.sharedVideo;
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
        // color="white"
        style={{height: 30, width: 30}}
        onPressColor={colors.off}
      />
    );
  };
  onProgress = (info) => {
    const {currentTime} = info;
    const {paused} = this.props.sharedVideo;
    this.props.updateVideoInfoCloud(paused, currentTime);
  };
  onSlidingStart = () => {
    this.props.updateVideoInfoCloud(true);
  };
  onSlidingComplete = async (SliderTime) => {
    const {paused} = this.props.sharedVideo;
    this.player.seek(SliderTime);
    this.props.updateVideoInfoCloud &&
      this.props.updateVideoInfoCloud(paused, SliderTime);
  };
  controlButtons(sharedVideo) {
    const {source, currentTime, paused} = sharedVideo;
    const {totalTime} = this.state;
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
            <Text style={[styleApp.text, {fontSize: 14}]}>
              {currentTime.toPrecision(2).toString()}/
              {totalTime.toPrecision(2).toString()}
            </Text>
          </Col>
        </Row>
      </View>
    );
  }
  render() {
    const {sharedVideo} = this.props;
    const {source, currentTime, paused} = sharedVideo;
    const {videoLoaded} = this.state;
    console.log('sharedVideo', sharedVideo);
    return (
      <Animated.View style={[styleApp.center, styleApp.stylePage]}>
        {!videoLoaded && <Loader color={'grey'} size={32} />}
        <Video
          source={{uri: source}}
          style={[styleApp.fullSize, {width: width}]}
          ref={(ref) => {
            this.player = ref;
          }}
          onLoad={(callback) => {
            console.log('onLoad fininsh');
            this.player.seek(currentTime);
            this.setState({videoLoaded: true, totalTime: callback.duration});
          }}
          repeat={true}
          onBuffer={this.onBuffer} // Callback when remote video is buffering
          onError={this.videoError}
          paused={paused}
          onProgress={(info) => !paused && this.onProgress(info)}
        />
        {this.controlButtons(sharedVideo)}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  controlButtons: {
    position: 'absolute',
    height: 50,
    width: width,
    bottom: 15,
    backgroundColor: colors.grey,
  },
  slideVideo: {width: '90%', height: 40},
});

VideoPlayer.propTypes = {
  updateVideoInfoCloud: PropTypes.func,
};
