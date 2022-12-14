import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import FadeInView from 'react-native-fade-in-view';

import Slider from './Slider';
import AllIcons from '../../../../layout/icons/AllIcons';
import CurrentTime from './CurrentTime';
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
      fullscreen: false,
      showSpeedSet: false,
      paused: this.props.paused,
    };
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
  setCurrentTime(currentTime, forceUpdate) {
    const {paused} = this.state;
    if (!paused || forceUpdate) {
      this.sliderRef.setCurrentTime(currentTime);
      this.currentTimeRef.setCurrentTime(currentTime);
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.paused !== state.paused) {
      return {
        paused: props.paused,
      };
    }
    return {};
  }
  getPaused() {
    return this.state.paused;
  }
  getCurrentTime() {
    return this.currentTimeRef.getCurrentTime();
  }
  playPauseButton = () => {
    const {togglePlayPause, totalTime, seek, onSlidingComplete} = this.props;
    const {paused} = this.state;
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
        // color={colors.grey}
        click={async () => {
          const currentTime = this.currentTimeRef.getCurrentTime();
          if (totalTime - currentTime < 0.05 && paused) {
            await seek(0);
            await onSlidingComplete(0, true);
            await this.setState({currentTime: 0});
          }
          await this.setState({paused: !paused});
          togglePlayPause();
        }}
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
        {showSpeedSet ? (
          <FadeInView
            duration={250}
            style={[
              styles.viewSpeedSet,
              {height: speeds.length * 30, top: -(speeds.length * 30 + 25)},
            ]}>
            {speeds.map((speed, i) => buttonSpeed(speed, i))}
            <View style={styles.triangleSpeedView} />
          </FadeInView>
        ) : null}
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
    let {heightControlBar} = this.props;
    const {
      sizeControlButton,
      hideFullScreenButton,
      opacityControlBar,
      setState,
      currentTime,
      onSlidingComplete,
      onSlidingStart,
      totalTime,
    } = this.props;
    if (!heightControlBar) {
      heightControlBar = initialHeightControlBar;
    }
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
          <Col size={60}>
            <Row style={styles.rowSlider}>
              <Col style={styleApp.center}>
                <Slider
                  onRef={(ref) => (this.sliderRef = ref)}
                  currentTime={currentTime}
                  totalTime={totalTime}
                  onValueChange={(value) =>
                    this.currentTimeRef.setCurrentTime(value)
                  }
                  onSlidingStart={async (SliderTime) => {
                    onSlidingStart(SliderTime);
                  }}
                  onSlidingComplete={(SliderTime) =>
                    onSlidingComplete(SliderTime)
                  }
                />
              </Col>
            </Row>
            {sizeControlButton !== 'sm' ? (
              <Row style={styles.rowTime}>
                <Col style={styleApp.center2}>
                  <CurrentTime
                    onRef={(ref) => (this.currentTimeRef = ref)}
                    currentTime={currentTime}
                  />
                </Col>
                <Col style={styleApp.center3}>
                  <Text style={styles.textTime}>
                    {totalTime && totalTime !== 0 ? displayTime(totalTime) : ''}
                  </Text>
                </Col>
              </Row>
            ) : null}
          </Col>
          {!hideFullScreenButton ? (
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
          ) : null}
          {sizeControlButton !== 'sm' ? (
            <Col size={10}>{this.speedButton()}</Col>
          ) : null}
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
    right: '5%',
    zIndex: 60,
    backgroundColor: colors.transparentGrey,
    borderRadius: 5,
    paddingTop: 10,
    paddingBottom: 10,
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
  rowSlider: {
    height: 45,
    paddingLeft: 10,
    paddingRight: 10,
  },
  rowTime: {
    height: 15,
    marginTop: -3,
    paddingLeft: 10,
    paddingRight: 10,
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
