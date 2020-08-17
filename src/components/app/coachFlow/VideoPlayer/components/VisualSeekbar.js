import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, PanResponder} from 'react-native';
import {BlurView, VibrancyView} from '@react-native-community/blur';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import FadeInView from 'react-native-fade-in-view';
import {
  PinchGestureHandler,
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import {isEqual, transform} from 'lodash';

import Slider from './Slider';
import AllIcons from '../../../../layout/icons/AllIcons';
import CurrentTime from './CurrentTime';
import ButtonColor from '../../../../layout/Views/Button';

import {native} from '../../../../animations/animations';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import sizes from '../../../../style/sizes';
import {displayTime} from '../../../../functions/coach';

const {initialHeightControlBar} = sizes;

class VisualSeekBar extends Component {
  constructor(props) {
    super(props);
    const {
      alwaysVisible,
      currentScreenSize,
      currentTime,
      totalTime,
    } = this.props;
    const {currentWidth: screenWidth} = currentScreenSize;

    this.state = {
      visible: alwaysVisible ? true : false,
      totalTime: 0,
      fullscreen: false,
      showSpeedSet: false,
      paused: this.props.paused ? this.props.paused : false,

      //Dynamic for zoom of seekbar
      seekbarBounds: [0.05 * screenWidth, 0.95 * screenWidth],
    };
    //Static for playhead
    this.playheadPosBounds = [0.05 * screenWidth, 0.95 * screenWidth];
    const {seekbarBounds} = this.state;
    const initialPlayhead = Number(
      (currentTime / totalTime) * (seekbarBounds[1] - seekbarBounds[0]) +
        seekbarBounds[0],
    );
    this.playheadPosition = new Animated.Value(
      initialPlayhead ? initialPlayhead : this.playheadPosBounds[0],
    );
    this._lastPlayheadPos = this.playheadPosBounds[0];
    this._translateY = new Animated.Value(0);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        // console.log('\n\n\n\n\n\nGestureState')
        // console.log(gestureState)
        // console.log('dx', gestureState.dx)
        // console.log('dy', gestureState.dy)
        // console.log('movex', gestureState.moveX)
        // console.log('movey', gestureState.moveY)

        /// PLAYHEAD POSITIONAL MANAGEMENT

        const {nativeEvent: event} = evt;
        // console.log(event)
        const touches = evt.nativeEvent.touches;

        const {moveX, dx, vx} = gestureState;
        const originX = moveX - dx;
        if (
          originX > this._lastPlayheadPos - 20 &&
          originX < this._lastPlayheadPos + 20
        ) {
          const playheadToValue =
            this._lastPlayheadPos + dx < this.playheadPosBounds[0]
              ? this.playheadPosBounds[0]
              : this._lastPlayheadPos + dx > this.playheadPosBounds[1]
              ? this.playheadPosBounds[1]
              : this._lastPlayheadPos + dx;

          this.movePlayhead(playheadToValue, true);
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderStart: (evt, gestureState) => {
        const {onSlidingStart} = this.props;
        onSlidingStart(this.getCurrentTime());
      },
      onPanResponderRelease: (evt, gestureState) => {
        const {onSlidingComplete} = this.props;
        if (this.playheadPosition._value !== this._lastPlayheadPos) {
          this._lastPlayheadPos = this.playheadPosition._value;
          onSlidingComplete(this.getCurrentTime());
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  toggleVisible(force) {
    const {visible: visibleState} = this.state;
    const visible = force !== undefined ? !force : visibleState;
    Animated.parallel([
      Animated.timing(this._translateY, native(visible ? 0 : 1, 150)),
    ]).start();
    this.setState({visible: !visible});
  }
  setCurrentTime(currentTime, forceUpdate) {
    const {paused} = this.state;
    const {totalTime} = this.props;
    if (!paused || forceUpdate) {
      this.sliderRef?.setCurrentTime(currentTime);
      this.currentTimeRef.setCurrentTime(currentTime);

      const {seekbarBounds} = this.state;
      const playheadPosition =
        (currentTime / totalTime) * (seekbarBounds[1] - seekbarBounds[0]) +
        seekbarBounds[0];
      this.movePlayhead(playheadPosition, false);
    }
  }
  movePlayhead(toValue, updateVideoOnSeek) {
    const {seek, totalTime, paused, onSlidingStart} = this.props;
    const {currentWidth} = this.props.currentScreenSize;

    this.playheadPosition.setValue(toValue);

    if (!updateVideoOnSeek) {
      this._lastPlayheadPos = this.playheadPosition._value;
    } else {
      const {seekbarBounds} = this.state;
      const newTime =
        ((toValue - seekbarBounds[0]) / (seekbarBounds[1] - seekbarBounds[0])) *
        totalTime;
      if (!paused) {
        onSlidingStart(newTime);
      }
      seek(newTime);
      this.currentTimeRef.setCurrentTime(newTime);
    }

    // current time position change
    if (this.playheadPosition._value > currentWidth - 90)
      this.currentTimeRef.overrideStyle({
        left: null,
        right: 5,
        textAlign: 'right',
      });
    else
      this.currentTimeRef.overrideStyle({
        left: 5,
        right: null,
        textAlign: 'left',
      });
  }
  static getDerivedStateFromProps(props, state) {
    if (props.paused !== state.paused)
      return {
        paused: props.paused,
      };
    return {};
  }
  getPaused() {
    return this.state.paused;
  }
  getCurrentTime() {
    return this.currentTimeRef.getCurrentTime();
  }

  // speedButton() {
  //   const {showSpeedSet} = this.state;
  //   const {updatePlayRate, playRate, setState} = this.props;
  //   const speeds = [
  //     {
  //       label: '0.25',
  //       value: 0.25,
  //     },
  //     {
  //       label: '0.5',
  //       value: 0.5,
  //     },
  //     {
  //       label: 'Normal',
  //       value: 1,
  //     },
  //     {
  //       label: '1.5',
  //       value: 1.5,
  //     },
  //     {
  //       label: '2',
  //       value: 2,
  //     },
  //   ];
  //   const buttonSpeed = (speed, i) => {
  //     return (
  //       <ButtonColor
  //         key={i}
  //         view={() => {
  //           return (
  //             <Text
  //               style={[
  //                 styleApp.text,
  //                 {
  //                   color: playRate === speed.value ? colors.red : colors.white,
  //                 },
  //               ]}>
  //               {speed.label}
  //             </Text>
  //           );
  //         }}
  //         click={async () => {
  //           this.setState({showSpeedSet: false});
  //           setState({playRate: speed.value});
  //           updatePlayRate(speed.value);
  //         }}
  //         style={{height: 30, width: '100%'}}
  //         onPressColor={colors.off}
  //       />
  //     );
  //   };
  //   return (
  //     <View style={styleApp.fullSize}>
  //       {showSpeedSet && (
  //         <FadeInView
  //           duration={250}
  //           style={[
  //             styles.viewSpeedSet,
  //             {height: speeds.length * 30, top: -(speeds.length * 30 + 25)},
  //           ]}>
  //           {speeds.map((speed, i) => buttonSpeed(speed, i))}
  //           <View style={styles.triangleSpeedView} />
  //         </FadeInView>
  //       )}
  //       <ButtonColor
  //         view={() => {
  //           return (
  //             <AllIcons
  //               name={'ellipsis-v'}
  //               color={colors.white}
  //               size={20}
  //               type="font"
  //             />
  //           );
  //         }}
  //         // color={colors.off2}
  //         click={() => this.setState({showSpeedSet: !showSpeedSet})}
  //         style={{height: 45, width: '100%'}}
  //         onPressColor={colors.off}
  //       />
  //     </View>
  //   );
  // }
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
                    console.log('slidingStartVisualSeekBar: ', SliderTime);
                    onSlidingStart(SliderTime);
                  }}
                  onSlidingComplete={(SliderTime) =>
                    onSlidingComplete(SliderTime)
                  }
                />
              </Col>
            </Row>
            {sizeControlButton !== 'sm' && (
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

  backdrop() {
    return (
      <BlurView
        style={{position: 'absolute', zIndex: -1, ...styleApp.fullSize, top: 0}}
        blurType="dark"
        blurAmount={20}
      />
    );
  }

  seekbar() {
    const {currentTime, currentScreenSize, totalTime} = this.props;
    const {currentWidth} = currentScreenSize;
    const {seekbarBounds} = this.state;

    //TODO Alter according to zoom level (0.9 * width is 1.0x zoom level)
    const width = seekbarBounds[1] - seekbarBounds[0];

    const playheadTimes = totalTime && [
      ((this.playheadPosBounds[0] - seekbarBounds[0]) /
        (seekbarBounds[1] - seekbarBounds[0])) *
        totalTime,
      ((this.playheadPosBounds[1] - seekbarBounds[1]) /
        (seekbarBounds[1] - seekbarBounds[0])) *
        totalTime +
        totalTime,
    ];

    return (
      <View style={{width: '100%', height: 125, paddingTop: 30}}>
        <View
          style={{width: '100%', height: 80}}
          {...this.panResponder.panHandlers}>
          <Animated.View
            style={{
              height: 40,
              width,
              backgroundColor: colors.grey + '40',
              marginTop: 5,
              transform: [{translateX: seekbarBounds[0]}],
            }}
          />
          <View style={{paddingHorizontal: '5%', marginTop: 5}}>
            <Row style={{height: 35}}>
              <Col>
                <Text
                  style={{
                    ...styles.textTime,
                    textAlign: 'left',
                    marginLeft: 5,
                  }}>
                  {playheadTimes[0] !== undefined
                    ? displayTime(playheadTimes[0])
                    : ''}
                </Text>
                <View style={{...styles.boundLines, left: 0}} />
              </Col>
              <Col>
                <Text
                  style={{
                    ...styles.textTime,
                    textAlign: 'right',
                    marginRight: 5,
                  }}>
                  {playheadTimes[1] !== undefined
                    ? displayTime(playheadTimes[1])
                    : ''}
                </Text>
                <View style={{...styles.boundLines, right: 0}} />
              </Col>
            </Row>
          </View>
          <Animated.View
            style={{
              position: 'absolute',
              height: 60,
              transform: [{translateX: this.playheadPosition}],
            }}>
            <View style={styles.playhead} />
            <CurrentTime
              onRef={(ref) => (this.currentTimeRef = ref)}
              currentTime={currentTime}
              style={{
                left: 5,
                fontSize: 12,
                position: 'absolute',
                bottom: -2,
                width: 90,
              }}
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  playPauseButton = () => {
    const {
      togglePlayPause,
      totalTime,
      seek,
      onSlidingComplete,
      prevPaused,
    } = this.props;
    const {paused} = this.state;
    console.log('\npaused', paused, 'prev', prevPaused);
    return (
      <ButtonColor
        view={() => {
          return (
            <AllIcons
              name={
                (paused && prevPaused === undefined) || (paused && prevPaused)
                  ? 'play'
                  : 'pause'
              }
              color={colors.white}
              size={20}
              type="font"
            />
          );
        }}
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

  fineSeekButton = (options) => {
    const {togglePlayPause, totalTime, seek, onSlidingComplete} = this.props;
    const {paused} = this.state;
    const {threshold, forward} = options;
    const iconName =
      threshold === 'frame'
        ? forward
          ? 'angle-right'
          : 'angle-left'
        : forward
        ? 'angle-double-right'
        : 'angle-double-left';
    return (
      <ButtonColor
        enableLongPress
        view={() => {
          return (
            <AllIcons
              name={iconName}
              color={colors.white}
              size={20}
              type="font"
            />
          );
        }}
        click={async () => {
          const currentTime = this.currentTimeRef.getCurrentTime();
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
          if (newTime > totalTime) newTime = totalTime;
          if (newTime < 0) newTime = 0;
          seek(newTime, true);
          await this.setCurrentTime(newTime, true);
          await this.setState({currentTime: newTime, paused: true});
        }}
        style={{height: 45, width: '100%'}}
        onPressColor={colors.off}
      />
    );
  };

  speedButton() {
    return (
      <Row
        style={{
          ...styleApp.center,
          position: 'absolute',
          height: 20,
          top: -25,
          width: '100%',
        }}>
        <ButtonColor
          enableLongPress
          view={() => {
            return (
              <View
                style={{
                  ...styleApp.shadowWeak,
                  ...styleApp.center,
                  width: 40,
                  height: 20,
                  borderRadius: 15,
                  backgroundColor: colors.greenStrong,
                }}>
                <Text
                  style={{
                    ...styleApp.textBold,
                    fontSize: 12,
                    color: colors.white,
                    textAlign: 'center',
                  }}>
                  1x
                </Text>
              </View>
            );
          }}
          click={async () => {
            console.log('clicky');
          }}
        />
      </Row>
    );
  }

  controlBar() {
    const fineSeekConfig = [
      {threshold: 10, forward: false},
      {threshold: 'frame', forward: false},
      {threshold: 'frame', forward: true},
      {threshold: 10, forward: true},
    ];

    return (
      <View style={{width: '100%', height: 50}}>
        <Row>
          <Col />
          <Col>{this.fineSeekButton(fineSeekConfig[0])}</Col>
          <Col>{this.fineSeekButton(fineSeekConfig[1])}</Col>
          <Col>{this.playPauseButton()}</Col>
          <Col>{this.fineSeekButton(fineSeekConfig[2])}</Col>
          <Col>{this.fineSeekButton(fineSeekConfig[3])}</Col>
          <Col />
        </Row>
        {this.speedButton()}
      </View>
    );
  }

  controlsBody() {
    const {style, currentScreenSize} = this.props;
    const {currentHeight, currentWidth: width} = currentScreenSize;
    const height = (style?.height ? style.height : 175) + sizes.marginBottomApp;
    const top = currentHeight - height;
    const translateY = this._translateY.interpolate({
      inputRange: [0, 1],
      outputRange: [height, 0],
    });

    return (
      <Animated.View
        style={{
          position: 'absolute',
          overflow: 'hidden',
          borderTopRightRadius: 25,
          borderTopLeftRadius: 25,
          minHeight: 175,
          top,
          height,
          width,
          transform: [{translateY}],
        }}>
        {this.seekbar()}
        {this.controlBar()}
        {this.backdrop()}
      </Animated.View>
    );
  }

  render() {
    return this.controlsBody();
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
  slideVideo: {
    width: '100%',
    height: 40,
    marginTop: 0,
  },
  textTime: {
    ...styleApp.textBold,
    fontSize: 12,
    color: colors.white,
    top: 15,
    textAlign: 'right',
    color: colors.greyDark,
  },
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
  playhead: {
    width: 2,
    marginLeft: -1.5,
    height: '100%',
    backgroundColor: colors.white,
  },
  boundLines: {
    width: 1,
    height: 73,
    position: 'absolute',
    top: -45,
    backgroundColor: colors.greyDark + '40',
  },
});

VisualSeekBar.propTypes = {
  paused: PropTypes.bool,
  currentTime: PropTypes.number,

  heightControlBar: PropTypes.number,
  sizeControlButton: PropTypes.string,
  hideFullScreenButton: PropTypes.bool,

  buttonTopRight: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {},
)(VisualSeekBar);
