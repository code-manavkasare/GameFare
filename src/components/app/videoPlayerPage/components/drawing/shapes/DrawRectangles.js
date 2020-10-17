import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import Svg, {Rect} from 'react-native-svg';

import colors from '../../../../../style/colors';
import {dimensionRectangle} from '../../../../../functions/videoManagement';

class DrawSraightLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawing: false,
      startPoint: {x: 0, y: 0},
      endPoint: {x: 0, y: 0},
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

  drawView() {
    const {strokeWidth, strokeColor, startPoint, endPoint} = this.props;

    const {x: x1, y: y1} = startPoint;
    const {height, width} = dimensionRectangle({startPoint, endPoint});
    return (
      <Rect
        x={x1}
        y={y1}
        height={height}
        width={width}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
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
