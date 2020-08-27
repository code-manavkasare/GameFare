import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, PanResponder} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import CurrentTime from './CurrentTime';

import {native} from '../../../../animations/animations';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import sizes from '../../../../style/sizes';
import {displayTime} from '../../../../functions/coach';
import ControlBar from './ControlBar';
import Filmstrip from './Filmstrip';

class VisualSeekBar extends Component {
  constructor(props) {
    super(props);
    const {
      alwaysVisible,
      currentScreenSize,
      currentTime,
      totalTime,
    } = this.props;
    let {width} = this.props;
    if (!width) {
      width = currentScreenSize.currentWidth;
    }
    width *= 0.96;
    this.state = {
      visible: alwaysVisible ? true : false,
      totalTime: 0,
      fullscreen: false,
      showSpeedSet: false,
      width,
      paused: this.props.paused ? this.props.paused : false,
      //Dynamic for zoom of seekbar
      seekbar: {
        xOffset: new Animated.Value(0.05 * width),
        width: new Animated.Value(0.9 * width),
      },
    };
    //Static for playhead
    this.playheadPosBounds = [0.05 * width, 0.95 * width];
    const {seekbar} = this.state;
    const initialPlayhead = Number(
      (currentTime / totalTime) * seekbar.width._value + seekbar.xOffset._value,
    );
    this.playheadPosition = new Animated.Value(
      initialPlayhead ? initialPlayhead : this.playheadPosBounds[0],
    );

    this._revealSeekbar = new Animated.Value(0);

    this._lastPlayheadPos = this.playheadPosBounds[0];
    this._lastSeekbar = {
      xOffset: seekbar.xOffset._value,
      width: seekbar.width._value,
    };

    this.panResponder = PanResponder.create({
      onPanResponderMove: (evt, gestureState) => {
        /// PLAYHEAD POSITIONAL MANAGEMENT
        const {disableControls} = this.props;
        if (disableControls) {
          return;
        }
        let {moveX, dx} = gestureState;
        if (this.panResponderOffset) moveX = moveX - this.panResponderOffset;
        const playheadToValue =
          this._lastPlayheadPos + dx < this.playheadPosBounds[0]
            ? this.playheadPosBounds[0]
            : this._lastPlayheadPos + dx > this.playheadPosBounds[1]
            ? this.playheadPosBounds[1]
            : this._lastPlayheadPos + dx;
        this.movePlayhead(playheadToValue, true);
      },
      onPanResponderStart: (evt, gestureState) => {
        const {disableControls, onSlidingStart} = this.props;
        const {seekbar} = this.state;
        if (disableControls) {
          return;
        }
        let {x0} = gestureState;
        if (this.panResponderOffset) x0 = x0 - this.panResponderOffset;
        const playheadToValue = x0 - seekbar.xOffset._value / 2;
        this.movePlayhead(playheadToValue, true);
        this._lastPlayheadPos = playheadToValue;
        onSlidingStart(this.getCurrentTime());
      },
      onPanResponderRelease: (evt, gestureState) => {
        const {disableControls} = this.props;
        if (disableControls) {
          return;
        }

        const {onSlidingComplete} = this.props;
        this._lastPlayheadPos = this.playheadPosition._value;
        onSlidingComplete(this.getCurrentTime());
      },
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => true,
    });
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentDidUpdate(prevProps, prevState) {
    const {width} = this.state;
    const {seekbar: prevSeekbar, width: prevWidth} = prevState;
    if (width !== prevState.width) {
      const newSeekbar = {
        xOffset: (prevSeekbar.xOffset._value / prevWidth) * width,
        width: (prevSeekbar.width._value / prevWidth) * width,
      };
      const newBounds = [0.05 * width, 0.95 * width];
      let newValue =
        ((this.playheadPosition._value - this.playheadPosBounds[0]) /
          (this.playheadPosBounds[1] - this.playheadPosBounds[0])) *
          (newBounds[1] - newBounds[0]) +
        newBounds[0];
      this.playheadPosition.setValue(newValue);
      this.state.seekbar.xOffset.setValue(newSeekbar.xOffset);
      this.state.seekbar.width.setValue(newSeekbar.width);
      this.playheadPosBounds = newBounds;
    }
  }
  static getDerivedStateFromProps(props, state) {
    const {currentScreenSize, width: propsWidth, size} = props;
    const {currentWidth: screenWidth} = currentScreenSize;

    const width = (propsWidth ? propsWidth : screenWidth) * 0.96;
    let newState = {
      size: size ? size : 'lg',
      width,
    };
    if (props.paused !== state.paused) {
      newState = {
        ...newState,
        paused: props.paused,
      };
    }
    return {
      ...newState,
    };
  }
  toggleVisible(force) {
    const {visible: visibleState} = this.state;
    const visible = force !== undefined ? !force : visibleState;
    Animated.parallel([
      Animated.timing(this._revealSeekbar, native(visible ? 0 : 1, 200)),
    ]).start();
    const timeout = visible ? 200 : 0;
    setTimeout(() => {
      this.setState({visible: !visible});
    }, timeout);
  }
  setCurrentTime(currentTime, forceUpdate) {
    const {paused} = this.state;
    const {totalTime} = this.props;
    if (!paused || forceUpdate) {
      this.sliderRef?.setCurrentTime(currentTime);
      this.currentTimeRef?.setCurrentTime(currentTime);

      const {seekbar} = this.state;
      const playheadPosition =
        (currentTime / totalTime) * seekbar.width._value +
        seekbar.xOffset._value;
      this.movePlayhead(playheadPosition, false);
    }
  }
  movePlayhead(toValue, updateVideoOnSeek) {
    const {seek, totalTime, paused, onSlidingStart} = this.props;
    const {width} = this.state;

    this.playheadPosition.setValue(toValue);
    if (!updateVideoOnSeek) {
      this._lastPlayheadPos = toValue;
    } else {
      const {seekbar} = this.state;
      const newTime =
        ((toValue - seekbar.xOffset._value) / seekbar.width._value) * totalTime;
      // console.log(newTime);
      if (!paused) {
        onSlidingStart(newTime);
      }

      seek(newTime);
      this.currentTimeRef?.setCurrentTime(newTime);
    }

    // current time position change when the playhead gets too close
    if (toValue > width - 90) {
      this.currentTimeRef?.overrideStyle({
        left: null,
        right: 5,
        textAlign: 'right',
      });
    } else {
      this.currentTimeRef?.overrideStyle({
        left: 5,
        right: null,
        textAlign: 'left',
      });
    }
  }
  setXOffset(x) {
    this.panResponderOffset = x;
  }
  zoomSeekbar(dx) {
    const {width} = this.state;

    const seekbarWidthValue =
      this._lastSeekbar.width + dx < 0.9 * width
        ? 0.9 * width
        : this._lastSeekbar.width + dx > 1000
        ? 1000
        : this._lastSeekbar.width + dx;
    const playheadToValue =
      ((this._lastPlayheadPos - this._lastSeekbar.xOffset) /
        this._lastSeekbar.width) *
        seekbarWidthValue +
        this._lastSeekbar.xOffset <
      this.playheadPosBounds[0]
        ? this.playheadPosBounds[0]
        : ((this._lastPlayheadPos - this._lastSeekbar.xOffset) /
            this._lastSeekbar.width) *
            seekbarWidthValue +
            this._lastSeekbar.xOffset >
          this.playheadPosBounds[1]
        ? this.playheadPosBounds[1]
        : ((this._lastPlayheadPos - this._lastSeekbar.xOffset) /
            this._lastSeekbar.width) *
            seekbarWidthValue +
          this._lastSeekbar.xOffset;

    this.playheadPosition.setValue(playheadToValue);
    this.state.seekbar.width.setValue(seekbarWidthValue);
    this._lastSeekbar.width = seekbarWidthValue;
    this._lastPlayheadPos = playheadToValue;
  }
  getPaused() {
    return this.state.paused;
  }
  getCurrentTime() {
    return this.currentTimeRef?.getCurrentTime();
  }

  seekbarMarkers() {
    const {totalTime} = this.props;
    const {seekbar} = this.state;

    const width = seekbar.width._value;

    let playheadTimes = [0, 0];
    if (totalTime) {
      const minTime =
        ((this.playheadPosBounds[0] - seekbar.xOffset._value) / width) *
        totalTime;
      const maxTime =
        ((this.playheadPosBounds[1] - seekbar.xOffset._value + width) / width) *
          totalTime +
        totalTime;
      playheadTimes = [
        minTime >= 0 ? minTime : 0,
        maxTime <= totalTime ? maxTime : totalTime,
      ];
    }

    const leftTextStyle = {
      ...styles.textTime,
      textAlign: 'left',
      marginLeft: -5,
    };

    const rightTextStyle = {
      ...styles.textTime,
      textAlign: 'right',
      marginRight: -5,
    };

    return (
      <View style={styles.seekbarMarkersContainer}>
        <Row>
          <Col>
            <Text style={leftTextStyle}>{displayTime(playheadTimes[0])}</Text>
          </Col>
          <Col>
            <Text style={rightTextStyle}>{displayTime(playheadTimes[1])}</Text>
          </Col>
        </Row>
      </View>
    );
  }

  playhead() {
    const {currentTime} = this.props;
    const {size} = this.state;
    const small = size === 'sm';

    const playheadContainerStyle = {
      position: 'absolute',
      height: small ? 25 : 60,
      transform: [{translateX: this.playheadPosition}],
    };

    return (
      <Animated.View style={playheadContainerStyle}>
        <View style={styles.playhead} />
        <CurrentTime
          onRef={(ref) => (this.currentTimeRef = ref)}
          currentTime={currentTime}
          style={styles.playheadText}
        />
      </Animated.View>
    );
  }

  seekbar() {
    const {disableControls, source, onSeekbarLoad, archiveId} = this.props;
    const {seekbar, size, width} = this.state;
    const small = size === 'sm';

    const seekbarContainerStyle = {
      ...styles.seekbarContainer,
      height: small ? 65 : 130,
      opacity: disableControls ? 0.7 : 1,
    };
    const panHandlerStyle = {
      width: '100%',
      height: small ? 30 : 80,
    };
    const seekbarStyle = {
      height: small ? 7 : 40,
      borderRadius: small ? 5 : 0,
      width: seekbar.width,
      backgroundColor: colors.grey + '40',
      marginTop: 5,
      transform: [{translateX: seekbar.xOffset}],
    };
    return (
      <View style={seekbarContainerStyle}>
        <View style={panHandlerStyle} {...this.panResponder.panHandlers}>
          <Animated.View style={seekbarStyle}>
            {!small && (
              <Filmstrip
                onRef={(ref) => (this.filmstripRef = ref)}
                source={source}
                archiveId={archiveId}
                seekbar={seekbar}
                width={width}
                height={seekbarStyle.height}
                onFilmstripLoad={() => onSeekbarLoad()}
              />
            )}
          </Animated.View>
          {this.seekbarMarkers()}
          {this.playhead()}
        </View>
      </View>
    );
  }

  controlsBody() {
    const {
      style,
      togglePlayPause,
      totalTime,
      seek,
      onSlidingComplete,
      prevPaused,
      updatePlayRate,
      disableControls,
    } = this.props;
    const {paused, size, visible} = this.state;

    const small = size === 'sm';

    const minHeight = small ? 120 : 180;
    const height = style?.height ? style.height : minHeight;

    const translateY = this._revealSeekbar.interpolate({
      inputRange: [0, 1],
      outputRange: [!small ? height + sizes.marginBottomApp + 5 : 0, 0],
    });
    const opacity = this._revealSeekbar.interpolate({
      inputRange: [0, 1],
      outputRange: [small ? 0 : 1, 1],
    });

    const containerStyle = {
      ...styles.container,
      height,
      opacity,
      transform: [{translateY}],
    };

    return (
      // visible && (
      <Animated.View
        pointerEvents={visible ? null : 'none'}
        style={containerStyle}>
        {this.seekbar()}

        <ControlBar
          disableControls={disableControls}
          size={size}
          getCurrentTime={this.getCurrentTime.bind(this)}
          setCurrentTime={this.setCurrentTime.bind(this)}
          togglePlayPause={() => togglePlayPause()}
          totalTime={totalTime}
          seek={(time) => seek(time, true)}
          onSlidingComplete={(time, force) => onSlidingComplete(time, force)}
          paused={paused}
          prevPaused={prevPaused}
          updatePlayRate={(rate) => updatePlayRate(rate)}
        />

        <BlurView style={styles.blurView} blurType="dark" blurAmount={20} />
      </Animated.View>
      // )
    );
  }

  render() {
    return this.controlsBody();
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 25,
    bottom: sizes.marginBottomApp + 5,
    width: '96%',
  },
  textTime: {
    ...styleApp.textBold,
    fontSize: 12,
    top: -20,
    textAlign: 'right',
    color: colors.greyDark,
  },
  playhead: {
    width: 2,
    marginLeft: -1.5,
    height: '100%',
    backgroundColor: colors.white,
  },
  blurView: {
    position: 'absolute',
    zIndex: -1,
    ...styleApp.fullSize,
    top: 0,
  },
  seekbarContainer: {
    width: '100%',
    paddingTop: 35,
  },
  seekbarMarkersContainer: {
    paddingHorizontal: '5%',
    position: 'absolute',
    width: '100%',
    height: 15,
  },
  playheadText: {
    left: 5,
    fontSize: 12,
    position: 'absolute',
    bottom: -4,
    width: 90,
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
