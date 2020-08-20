import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import PropTypes from 'prop-types';

import {native} from '../../animations/animations';

export default class PinchableBox extends Component {
  static PropTypes = {
    onPinch: PropTypes.func,
    onDrag: PropTypes.func,
  };
  static defaultProps = {
    onPinch: (scale) => null,
    onDrag: (position) => null,
  };
  _baseScale = new Animated.Value(1);
  _pinchScale = new Animated.Value(1);
  scale = Animated.multiply(this._baseScale, this._pinchScale);
  _translateX = new Animated.Value(0);
  _translateY = new Animated.Value(0);
  _lastOffset = {x: 0, y: 0};
  _lastScale = 1;
  doubleTapRef = React.createRef();
  componentDidMount() {
    this.props.onRef(this);
  }
  onPinchGestureEvent = Animated.event(
    [{nativeEvent: {scale: this._pinchScale}}],
    {
      useNativeDriver: true,
      listener: this.onPan.bind(this),
    },
  );
  onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          // translationX: this._translateX,
          // translationY: this._translateY,
        },
      },
    ],
    {
      useNativeDriver: true,
      listener: (event) => {
        const newPosition = {
          x: event.nativeEvent.translationX + this._lastOffset.x,
          y: event.nativeEvent.translationY + this._lastOffset.y,
        };

        this.setNewPosition(newPosition);
      },
    },
  );

  onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastScale *= event.nativeEvent.scale;
      this.setNewScale(this._lastScale);
    }
  };
  setNewScale = (scale) => {
    this._pinchScale.setValue(1);
    this._baseScale.setValue(scale);
    //utility of this two line after ?
    const {scaleChange} = this.props;
    scaleChange(scale);

    this.props.onPinch(scale);
  };
  setNewPosition = (position) => {
    this._translateX.setValue(position.x);
    this._translateY.setValue(position.y);
  };

  onPan({nativeEvent: {scale}}) {}
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x = this._translateX._value;
      this._lastOffset.y = this._translateY._value;
      this.props.onDrag(this._lastOffset);
    }
  };
  resetPosition() {
    const {onDrag, onPinch} = this.props;
    Animated.parallel([
      Animated.timing(this._translateX, native(0, 300)),
      Animated.timing(this._translateY, native(0, 300)),
      Animated.timing(this._pinchScale, native(1, 300)),
      Animated.timing(this._baseScale, native(1, 300)),
    ]).start();
    this._lastScale = 1;
    this._lastOffset = {x: 0, y: 0};
    onDrag(this._lastOffset);
    onPinch(this._lastScale);
  }
  _onSingleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const {singleTouch} = this.props;
      if (singleTouch) singleTouch();
    }
  };
  _onDoubleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      this.resetPosition();
    }
  };
  render() {
    const {styleContainer, component} = this.props;
    return (
      <PanGestureHandler
        onGestureEvent={this.onPanGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View style={styleContainer}>
          <PinchGestureHandler
            onGestureEvent={this.onPinchGestureEvent}
            onHandlerStateChange={this.onPinchHandlerStateChange}>
            <Animated.View style={styleContainer}>
              <TapGestureHandler
                onHandlerStateChange={this._onSingleTap}
                waitFor={this.doubleTapRef}>
                <Animated.View style={styleContainer}>
                  <TapGestureHandler
                    ref={this.doubleTapRef}
                    onHandlerStateChange={this._onDoubleTap}
                    numberOfTaps={2}>
                    <Animated.View
                      collapsable={false}
                      style={[
                        styleContainer,
                        {
                          transform: [
                            {scale: this.scale},
                            {
                              translateX: this._translateX,
                            },
                            {
                              translateY: this._translateY,
                            },
                          ],
                        },
                      ]}>
                      {component()}
                    </Animated.View>
                  </TapGestureHandler>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}
