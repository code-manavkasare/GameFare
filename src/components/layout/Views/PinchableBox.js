import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';

export default class PinchableBox extends Component {
  _baseScale = new Animated.Value(1);
  _pinchScale = new Animated.Value(1);
  scale = Animated.multiply(this._baseScale, this._pinchScale);
  _translateX = new Animated.Value(0);
  _translateY = new Animated.Value(0);
  _lastOffset = {x: 0, y: 0};
  _lastScale = 1;
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
          translationX: this._translateX,
          translationY: this._translateY,
        },
      },
    ],
    {
      useNativeDriver: true,
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
  onPan({nativeEvent: {scale}}) {
    // console.log('onPan', scale);
  }
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x += event.nativeEvent.translationX;
      this._lastOffset.y += event.nativeEvent.translationY;
      this._translateX.setOffset(this._lastOffset.x);
      this._translateX.setValue(0);
      this._translateY.setOffset(this._lastOffset.y);
      this._translateY.setValue(0);
    }
  };
  resetPosition() {
    this._translateX.setValue(0);
    this._translateY.setValue(0);
    this._pinchScale.setValue(1);
    this._baseScale.setValue(1);
    this._lastScale = 1;
  }
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
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}
