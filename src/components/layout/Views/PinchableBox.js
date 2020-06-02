import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';

import {native} from '../../animations/animations';

export default class PinchableBox extends Component {
  _baseScale = new Animated.Value(1);
  _pinchScale = new Animated.Value(1);
  scale = Animated.multiply(this._baseScale, this._pinchScale);
  _lastScale = 1;
  onPinchGestureEvent = Animated.event(
    [{nativeEvent: {scale: this._pinchScale}}],
    {
      useNativeDriver: true,
      listener: this.onPan.bind(this),
    },
  );

  onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      console.log('on pinch state change', event.nativeEvent.scale);
      this._lastScale *= event.nativeEvent.scale;
      this._baseScale.setValue(this._lastScale);
      this._pinchScale.setValue(1);
    }
  };
  onPan({nativeEvent: {scale}}) {
    console.log('onPan', scale);
    // this.scale.setValue(scale);
  }

  render() {
    const {styleContainer, component} = this.props;
    return (
      <PinchGestureHandler
        onGestureEvent={this.onPinchGestureEvent}
        onHandlerStateChange={this.onPinchHandlerStateChange}>
        <Animated.View
          collapsable={false}
          style={[
            styleContainer,
            {
              // backgroundColor: '#FF0000' + '69',
              transform: [{scale: this.scale}],
            },
          ]}>
          {component()}
        </Animated.View>
      </PinchGestureHandler>
    );
  }
}
