import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import ButtonColor from '../../../layout/Views/Button';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {native} from '../../../animations/animations';
import Loader from '../../../layout/loaders/Loader';

import Timer from '../../../app/coachFlow/StreamPage/components/StreamView/footer/components/Timer';

export default class RecordButton extends Component {
  static propTypes = {
    startRecording: PropTypes.func.isRequired,
    stopRecording: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      renderTimer: false,
      startRecordingTime: null,
      isRecording: false,
      loader: false,
    };
    this.recordingIndicator = {
      color: new Animated.Value(0),
    };
    this.animatedTimerValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(this);
    }
  }
  indicatorAnimation() {
    const {isRecording} = this.state;
    if (isRecording) {
      Animated.timing(this.recordingIndicator.color, native(1, 1000)).start(
        () => {
          Animated.timing(this.recordingIndicator.color, native(0, 1000)).start(
            () => {
              this.indicatorAnimation();
            },
          );
        },
      );
    } else {
      this.recordingIndicator.color.setValue(0);
    }
  }
  timerAnimation() {
    const {isRecording, renderTimer} = this.state;
    if (isRecording) {
      Animated.timing(this.animatedTimerValue, native(1, 300)).start();
    } else if (renderTimer) {
      Animated.timing(this.animatedTimerValue, native(0, 300)).start(() => {
        this.setState({renderTimer: false, startRecordingTime: null});
      });
    }
  }
  insideRecordButton() {
    const {isRecording, loader} = this.state;
    return (
      <Animated.View
        style={[
          loader
            ? {...styleApp.fullSize, ...styleApp.center}
            : isRecording
            ? styles.buttonStartRecording
            : styles.buttonStopRecording,
        ]}>
        {loader ? (
          <Loader size={40} color={colors.white} />
        ) : (
          <Animated.View
            style={[
              styles.recordingOverlay,
              {opacity: this.recordingIndicator.color},
            ]}
          />
        )}
      </Animated.View>
    );
  }
  timer() {
    const {renderTimer, startRecordingTime} = this.state;
    if (renderTimer) {
      const optionsTimer = {
        text: [styleApp.textBold, {color: colors.white, fontSize: 15}],
      };
      const translateY = this.animatedTimerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [60, 0],
      });
      return (
        <Animated.View
          style={[
            styles.timer,
            {
              transform: [{translateY: translateY}],
              opacity: this.animatedTimerValue,
            },
          ]}>
          <Timer startTime={startRecordingTime} options={optionsTimer} />
        </Animated.View>
      );
    } else {
      return null;
    }
  }
  async clickRecord() {
    const {isRecording} = this.state;
    const {startRecording, stopRecording} = this.props;
    if (isRecording) {
      await this.setState({loader: true, isRecording: false});
      await stopRecording();
      this.setState({loader: false});
    } else {
      startRecording();
      this.setState({
        isRecording: true,
        renderTimer: true,
        startRecordingTime: Date.now(),
      });
    }
  }
  render() {
    this.indicatorAnimation();
    this.timerAnimation();
    return (
      <View style={[styleApp.center, styleApp.fullSize]}>
        {this.timer()}
        <ButtonColor
          view={() => this.insideRecordButton()}
          click={() => this.clickRecord()}
          style={styles.whiteButtonRecording}
          onPressColor={colors.redLight}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  whiteButtonRecording: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    // borderWidth: 5,
    // borderColor: colors.off,
    width: 55,
    borderRadius: 42.5,
  },
  buttonStopRecording: {
    ...styleApp.center,
    backgroundColor: colors.transparent,
    opacity: 0.8,
    overflow: 'hidden',
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  buttonStartRecording: {
    ...styleApp.center,
    backgroundColor: colors.greyDark,
    opacity: 0.8,
    overflow: 'hidden',
    height: 25,
    width: 25,
    borderRadius: 5,
  },
  recordingOverlay: {
    backgroundColor: colors.redLight,
    height: '100%',
    width: '100%',
  },
  buttonRound: {
    ...styleApp.fullSize,
    height: 55,
    width: 55,
    borderRadius: 27.5,
  },
  timer: {
    ...styleApp.center,
    position: 'absolute',
    backgroundColor: colors.title + '70',
    bottom: 100,
    width: 80,
    borderRadius: 4,
    height: 30,
  },
});
