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
    };
  }
  componentDidMount() {}

  togglePlayPause = async () => {
    await this.setState({paused: this.state.paused ? false : true});
    const {currentTime, paused} = this.state;
    console.log('currentTimeVideoPLayer: ', currentTime);
    this.props.updateVideoInfoCloud &&
      this.props.updateVideoInfoCloud(paused, currentTime);
  };
  onBuffer = () => {
    console.log('buffer');
  };
  videoError = () => {
    console.log('error');
  };
  playPauseButton = () => {
    const {paused} = this.state;
    if (paused)
      return <Button onPress={() => this.togglePlayPause()} title="Play" />;
    return <Button onPress={() => this.togglePlayPause()} title="Pause" />;
  };
  onProgress = (info) => {
    const {currentTime, seekableDuration} = info;
    // console.log(info);
    this.setState({currentTime: currentTime, totalTime: seekableDuration});
  };
  onSlidingStart = () => {
    this.setState({paused: true});
  };
  onSlidingComplete = async (SliderTime) => {
    this.player.seek(SliderTime);
    await this.setState({currentTime: SliderTime, paused: false});
    this.props.updateVideoInfoCloud &&
      this.props.updateVideoInfoCloud(this.state.paused, SliderTime);
  };

  render() {
    const {paused, currentTime, totalTime} = this.state;
    const {source} = this.props;
    const archive =
      'https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4';
    return (
      <Animated.View>
        <Row>
          <Video
            source={{uri: source}}
            style={[styleApp.fullSize, {width: width}]}
            ref={(ref) => {
              this.player = ref;
            }}
            repeat={true}
            onBuffer={this.onBuffer} // Callback when remote video is buffering
            onError={this.videoError}
            paused={paused}
            onProgress={(info) => this.onProgress(info)}
          />
        </Row>
        <Row style={{width: width}}>
          <Col>{this.playPauseButton()}</Col>
          <Col>
            <Slider
              style={{width: 150, height: 40}}
              minimumValue={0}
              maximumValue={totalTime}
              value={currentTime}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              onSlidingStart={() => this.onSlidingStart()}
              onSlidingComplete={(SliderTime) =>
                this.onSlidingComplete(SliderTime)
              }
            />
          </Col>
          <Col>
            <Text>
              {currentTime.toPrecision(2).toString()}/
              {totalTime.toPrecision(2).toString()}
            </Text>
          </Col>
        </Row>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({});

VideoPlayer.propTypes = {
  source: PropTypes.string, //TODO: put isRequired when finished
  updateVideoInfoCloud: PropTypes.func,
};
