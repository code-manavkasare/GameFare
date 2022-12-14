import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, PanResponder} from 'react-native';
import {Rect, G, Circle} from 'react-native-svg';

import colors from '../../../../../style/colors';

export default class DrawSraightLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: () => {
        const {toggleSelect} = this.props;
        toggleSelect && toggleSelect(true);
      },

      onPanResponderMove: async (evt, gs) => {
        const {
          editShape,
          id,
          startPoint,
          endPoint,
          thirdPoint,
          path,
          w,
          h,
        } = this.props;
        const {x, y} = this.state;

        await this.setState({x: gs.dx, y: gs.dy});

        editShape &&
          editShape({
            id,
            startPoint: startPoint
              ? {
                  x: startPoint.x + gs.dx - x,
                  y: startPoint.y + gs.dy - y,
                }
              : null,
            endPoint: endPoint
              ? {
                  x: endPoint.x + gs.dx - x,
                  y: endPoint.y + gs.dy - y,
                }
              : null,
            thirdPoint: thirdPoint
              ? {
                  x: thirdPoint.x + gs.dx - x,
                  y: thirdPoint.y + gs.dy - y,
                }
              : null,
            path: path
              ? path.map((point) => {
                  return {
                    x: (point.x + gs.dx - x) / w,
                    y: (point.y + gs.dy - y) / h,
                  };
                })
              : null,
          });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gs) => {
        const {endEditShape} = this.props;
        endEditShape();
        this.setState({x: 0, y: 0});
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        return true;
      },
    });
  }

  drawView() {
    const {positionZone, backgroundColor, strokeColor, element} = this.props;
    const {x, y} = positionZone;
    if (element) return element(this._panResponder.panHandlers);
    return (
      <Circle
        cx={x}
        cy={y}
        r={15}
        stroke={strokeColor}
        strokeWidth={3}
        fill={'transparent'}
        strokeDasharray="10, 6"
        {...this._panResponder.panHandlers}
      />
    );
  }
  render() {
    return this.drawView();
  }
}
