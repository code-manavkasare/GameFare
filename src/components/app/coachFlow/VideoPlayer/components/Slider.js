import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import Slider from '@react-native-community/slider';
import PropTypes from 'prop-types';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

export default class SliderVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: this.props.currentTime,
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  setCurrentTime(currentTime) {
    this.setState({currentTime: currentTime});
  }
  slider() {
    const {
      onSlidingComplete,
      onSlidingStart,
      totalTime,
      onValueChange,
    } = this.props;
    const {currentTime} = this.state;
    return (
      <Slider
        style={styles.slideVideo}
        minimumValue={0}
        maximumValue={totalTime}
        value={currentTime}
        step={0.01}
        minimumTrackTintColor={colors.white}
        maximumTrackTintColor={colors.greyDark + '50'}
        onValueChange={(value) => onValueChange(value)}
        onSlidingStart={async (SliderTime) => {
          onSlidingStart(SliderTime);
        }}
        onSlidingComplete={(SliderTime) => onSlidingComplete(SliderTime)}
      />
    );
  }

  render() {
    return this.slider();
  }
}

const styles = StyleSheet.create({
  slideVideo: {width: '100%', height: 40, marginTop: 0},
});

SliderVideo.propTypes = {
  onSlidingStart: PropTypes.func,
  onSlidingComplete: PropTypes.func,
  onValueChange: PropTypes.func,
};
