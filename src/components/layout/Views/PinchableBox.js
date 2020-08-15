import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';

import {native} from '../../animations/animations';

export default class PinchableBox extends Component {
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
        this._translateX.setValue(event.nativeEvent.translationX + this._lastOffset.x)
        this._translateY.setValue(event.nativeEvent.translationY + this._lastOffset.y)
      }
    },
  );

  onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastScale *= event.nativeEvent.scale;
      this._baseScale.setValue(this._lastScale);
      this._pinchScale.setValue(1);
      const {scaleChange} = this.props;
      scaleChange(this._lastScale);
    }
  };
  onPan({nativeEvent: {scale}}) {}
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x = this._translateX._value
      this._lastOffset.y = this._translateY._value
    }
  };
  resetPosition() {
    this._lastOffset = {x: 0, y: 0};
    this._translateX.setValue(0);
    this._translateY.setValue(0);
    this._pinchScale.setValue(1);
    this._baseScale.setValue(1);
    this._lastScale = 1;
  }
  animateReset() {
    Animated.parallel([
      Animated.timing(this._translateX, native(0, 300)),
      Animated.timing(this._translateY, native(0, 300)),
      Animated.timing(this._pinchScale, native(1, 300)),
      Animated.timing(this._baseScale, native(1, 300))
    ]).start()
    this._lastScale = 1;
    this._lastOffset = {x: 0, y: 0};
  }
  _onSingleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const {singleTouch} = this.props;
      if (singleTouch) singleTouch();
    }
  };
  _onDoubleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      this.animateReset()
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
