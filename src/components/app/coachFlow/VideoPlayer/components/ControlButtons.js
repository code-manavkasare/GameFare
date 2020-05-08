import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import Slider from '@react-native-community/slider';
import PropTypes from 'prop-types';
import FadeInView from 'react-native-fade-in-view';

import AllIcons from '../../../../layout/icons/AllIcons';

import ButtonColor from '../../../../layout/Views/Button';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import sizes from '../../../../style/sizes';
import {displayTime} from '../../../../functions/coach';

const {initialHeightControlBar} = sizes;

export default class ControlButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalTime: 0,
      currentTime: this.props.currentTime,
      videoLoaded: false,
      fullscreen: false,
      showSpeedSet: false,
      updateCurrentTime: true,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.updateCurrentTime && !props.onSliding)
      return {
        currentTime: props.currentTime,
      };
    return {};
  }

  playPauseButton = () => {
    const {togglePlayPause, paused} = this.props;
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
        click={() => togglePlayPause()}
        style={{height: 45, width: '100%'}}
        onPressColor={colors.off}
      />
    );
  };

  speedButton() {
    const {showSpeedSet} = this.state;
    const {updatePlayRate, playRate, setState} = this.props;
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
                    color: playRate === speed.value ? colors.red : colors.white,
                  },
                ]}>
                {speed.label}
              </Text>
            );
          }}
          click={async () => {
            this.setState({showSpeedSet: false});
            setState({playRate: speed.value});
            updatePlayRate(speed.value);
          }}
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
  controlButtons() {
    const {totalTime} = this.props;
    const {currentTime} = this.state;
    // let remainingTime = 0;
    // if (totalTime !== 0)
    //   remainingTime = totalTime.toPrecision(2) - currentTime.toPrecision(2);
    let {
      heightControlBar,
      sizeControlButton,
      hideFullScreenButton,
      opacityControlBar,
      setState,
      paused,
      onSlidingComplete,
      onSlidingStart,
    } = this.props;
    if (!heightControlBar) heightControlBar = initialHeightControlBar;
    return (
      <Animated.View
        style={[
          styles.controlButtons,
          {
            height: heightControlBar,
            backgroundColor: colors.transparentGrey,
            opacity: opacityControlBar,
          },
        ]}>
        <Row>
          <Col size={10}>{this.playPauseButton()}</Col>
          {sizeControlButton === 'sm' && (
            <Col size={15} style={styleApp.center}>
              <Text style={styles.textTime}>{displayTime(currentTime)}</Text>
            </Col>
          )}
          <Col size={60}>
            <Row
              style={{
                height: 45,
              }}>
              <Col style={styleApp.center}>
                <Slider
                  style={styles.slideVideo}
                  minimumValue={0}
                  maximumValue={totalTime}
                  value={currentTime}
                  minimumTrackTintColor={colors.white}
                  maximumTrackTintColor={colors.greyDark + '50'}
                  // onValueChange={(value) => this.setState({currentTime: value})}
                  onSlidingStart={async () => {
                    await setState({
                      onSliding: true,
                      paused: true,
                      lastValuePaused: paused,
                    });

                    onSlidingStart();
                  }}
                  onSlidingComplete={async (SliderTime) => {
                    await onSlidingComplete(SliderTime);
                    await setState({onSliding: false});
                  }}
                />
              </Col>
            </Row>
            {sizeControlButton !== 'sm' && (
              <Row style={{height: 15, marginTop: -3}}>
                <Col style={styleApp.center2}>
                  <Text style={styles.textTime}>
                    {displayTime(currentTime)}
                  </Text>
                </Col>
                <Col style={styleApp.center3}>
                  {totalTime !== 0 && (
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
              onPress={() => setState({fullscreen: !this.state.fullscreen})}
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

  render() {
    return this.controlButtons();
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
  textTime: {...styleApp.textBold, fontSize: 14, color: colors.white},
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
  },
  triangleSpeedView: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 12,
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.transparentGrey,
    position: 'absolute',
    bottom: -12,
  },
});

ControlButtons.propTypes = {
  paused: PropTypes.bool,
  currentTime: PropTypes.number,

  heightControlBar: PropTypes.number,
  sizeControlButton: PropTypes.string,
  hideFullScreenButton: PropTypes.bool,

  buttonTopRight: PropTypes.func,
};
