import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import Svg, {Line} from 'react-native-svg';

import colors from '../../../../../style/colors';

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

  drawView() {
    const {strokeWidth, strokeColor, startPoint, endPoint} = this.props;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;

    return (
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
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
