import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Svg, {Line, Circle} from 'react-native-svg';

import colors from '../../../../style/colors';

class DrawSraightLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawing: false,
      startPoint: {},
      endPoint: {},
    };
    this.animatedLine = new Animated.Value(0);
  }
  _lastOffset = {x: 0, y: 0};
  _translateX = new Animated.Value(0);
  _translateY = new Animated.Value(0);
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
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
          x: event.nativeEvent.x,
          y: event.nativeEvent.y,
        };
        const {drawing} = this.state;
        if (!drawing) {
          return this.setState({
            startPoint: newPosition,
            endPoint: newPosition,
            drawing: true,
          });
        }
        console.log('newPosition',newPosition)
        return this.setState({
          endPoint: newPosition,
        });
      },
    },
  );
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const {startPoint, endPoint} = this.state;
      const {strokeWidth, strokeColor, onStrokeEnd} = this.props;

      onStrokeEnd({
        path: {
          data: {startPoint, endPoint},
          color: strokeColor,
          width: strokeWidth,
        },
      });
      return this.setState({
        drawing: false,
        startPoint: {x: 0, y: 0},
        endPoint: {x: 0, y: 0},
      });
    }
  };
  drawView() {
    const {strokeWidth, strokeColor} = this.props;
    const {drawing, startPoint, endPoint} = this.state;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;
    const {style} = this.props;
    let radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    if (!radius) radius = 0;
    console.log('radiuds', radius);
    return (
      <PanGestureHandler
        style={style}
        onGestureEvent={this.onPanGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View style={style}>
          <Svg height={style.height} width={style.width}>
            {drawing && (
              <Circle
                cx={x1}
                cy={y1}
                r={radius}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
            )}
          </Svg>
        </Animated.View>
      </PanGestureHandler>
    );
  }
  render() {
    return this.drawView();
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state, props) => {
  return {};
};

export default connect(
  mapStateToProps,
  {},
)(DrawSraightLine);
