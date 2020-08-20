import React, {Component} from 'react';
import {Text, View, StyleSheet, Animated} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';

import {native} from '../../../../animations/animations';

export default class ControlBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPlaybackSpeed: 1,
      speedSelectorVisible: false,
    };

    this.fineSeekConfig = [
      {threshold: 10, forward: false},
      {threshold: 'frame', forward: false},
      {threshold: 'frame', forward: true},
      {threshold: 10, forward: true},
    ];

    this.speedConfig = [0.25, 0.5, 1, 2];

    this.focusedSpeedRowOpacity = new Animated.Value(1);
    this.speedSelectorOpacity = new Animated.Value(0);
  }

  playPauseButton = () => {
    const {
      togglePlayPause,
      totalTime,
      seek,
      onSlidingComplete,
      prevPaused,
      paused,
      getCurrentTime,
    } = this.props;

    const buttonView = () => (
      <AllIcons
        name={paused ? 'play' : 'pause'}
        color={colors.white}
        size={20}
        type="font"
      />
    );

    const onClick = async () => {
      const currentTime = getCurrentTime();
      if (totalTime - currentTime < 0.05 && paused) {
        await seek(0);
        await onSlidingComplete(0, true);
      }
      togglePlayPause();
    };

    return (
      <ButtonColor
        view={buttonView}
        click={onClick}
        style={styles.playPauseButton}
        onPressColor={colors.off}
      />
    );
  };

  fineSeekButton = (options) => {
    const {getCurrentTime, totalTime, seek, setCurrentTime} = this.props;

    const {threshold, forward} = options;

    const iconName =
      threshold === 'frame'
        ? forward
          ? 'angle-right'
          : 'angle-left'
        : forward
        ? 'angle-double-right'
        : 'angle-double-left';

    const buttonView = () => {
      return (
        <AllIcons name={iconName} color={colors.white} size={20} type="font" />
      );
    };

    const onClick = async () => {
      const currentTime = getCurrentTime();
      const fps = 30;
      const rate = 1 / fps;
      let newTime =
        threshold === 'frame'
          ? forward
            ? currentTime + rate
            : currentTime - rate
          : forward
          ? currentTime + threshold
          : currentTime - threshold;
      if (newTime > totalTime) {
        newTime = totalTime;
      }
      if (newTime < 0) {
        newTime = 0;
      }
      seek(newTime, true);
      await setCurrentTime(newTime, true);
    };

    return (
      <ButtonColor
        enableLongPress
        view={buttonView}
        click={onClick}
        style={styles.fineSeekButton}
        onPressColor={colors.off}
      />
    );
  };

  speedButton(inputSpeed) {
    const {updatePlayRate} = this.props;
    const {currentPlaybackSpeed, speedSelectorVisible} = this.state;

    const styleSpeedButton =
      !inputSpeed || inputSpeed === currentPlaybackSpeed
        ? styles.focusedSpeedButton
        : styles.speedButton;

    const speed = inputSpeed ? inputSpeed : currentPlaybackSpeed;

    const speedText = speed >= 1 || speed === 0 ? speed : `1/${1 / speed}`;

    const buttonView = () => {
      return (
        <View style={styleSpeedButton}>
          <Text style={styles.speedText}>{speedText}x</Text>
        </View>
      );
    };

    const onClick = async () => {
      if (!speedSelectorVisible) {
        this.setState({speedSelectorVisible: !speedSelectorVisible});
        Animated.timing(this.focusedSpeedRowOpacity, native(0)).start();
        Animated.timing(
          this.speedSelectorOpacity,
          native(1, false, 150),
        ).start();
      } else {
        updatePlayRate(speed);
        this.setState({
          currentPlaybackSpeed: speed ? speed : currentPlaybackSpeed,
        });
        Animated.timing(
          this.speedSelectorOpacity,
          native(0, false, 300),
        ).start();
        Animated.timing(
          this.focusedSpeedRowOpacity,
          native(1, false, 450),
        ).start(() => {
          this.setState({speedSelectorVisible: !speedSelectorVisible});
        });
      }
    };

    return <ButtonColor view={buttonView} click={onClick} />;
  }

  speedSelector() {
    const speedCol = (speed) => (
      <Col key={speed}>{this.speedButton(speed)}</Col>
    );

    return <Row>{this.speedConfig.map(speedCol)}</Row>;
  }

  speedRow() {
    const {speedSelectorVisible} = this.state;

    const focusedSpeedStyle = {
      opacity: this.focusedSpeedRowOpacity,
    };
    const speedSelectorStyle = {
      ...styles.speedSelectorRow,
      opacity: this.speedSelectorOpacity,
    };

    return (
      <View style={styles.speedRowContainer}>
        <Animated.View style={focusedSpeedStyle}>
          {this.speedButton()}
        </Animated.View>
        {speedSelectorVisible && (
          <Animated.View style={speedSelectorStyle}>
            {this.speedSelector()}
          </Animated.View>
        )}
      </View>
    );
  }

  controlBar() {
    const {size, disableControls} = this.props;
    const small = size === 'sm';
    const controlBarStyle = {
      ...styles.controlBar,
      opacity: disableControls ? 0.7 : 1,
    };
    return (
      <View style={controlBarStyle} pointerEvents={disableControls && 'none'}>
        <Row style={styles.controlBarRow}>
          <Col>{this.fineSeekButton(this.fineSeekConfig[0])}</Col>
          <Col>{this.fineSeekButton(this.fineSeekConfig[1])}</Col>
          <Col>{this.playPauseButton()}</Col>
          <Col>{this.fineSeekButton(this.fineSeekConfig[2])}</Col>
          <Col>{this.fineSeekButton(this.fineSeekConfig[3])}</Col>
        </Row>
        {!small && this.speedRow()}
      </View>
    );
  }

  render() {
    return this.controlBar();
  }
}

const styles = StyleSheet.create({
  controlBar: {
    ...styleApp.center,
    width: '100%',
    height: 50,
  },
  controlBarRow: {maxWidth: 300},
  playPauseButton: {height: 45, width: '100%'},
  fineSeekButton: {height: 45, width: '100%'},
  speedRowContainer: {
    ...styleApp.center,
    position: 'absolute',
    height: 20,
    top: -25,
    width: '100%',
  },
  speedSelectorRow: {
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  focusedSpeedButton: {
    ...styleApp.shadowWeak,
    ...styleApp.center,
    width: 50,
    height: 25,
    borderRadius: 15,
    backgroundColor: colors.greenStrong,
  },
  speedButton: {
    ...styleApp.center,
    width: 50,
    height: 25,
    borderRadius: 15,
  },
  speedText: {
    ...styleApp.textBold,
    fontSize: 15,
    color: colors.white,
    textAlign: 'center',
  },
});
