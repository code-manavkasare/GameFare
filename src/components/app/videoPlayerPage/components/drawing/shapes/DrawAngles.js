import React, {Component} from 'react';
import {View, StyleSheet, Animated, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Line, Path, Text, G} from 'react-native-svg';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';

class DrawSraightLine extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  drawView() {
    const {
      strokeWidth,
      strokeColor,
      startPoint,
      endPoint,
      toggleSelect,
    } = this.props;

    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;

    const teta = 45;

    const xc = x1 + (x2 - x1) * Math.cos(teta) - (y2 - y1) * Math.sin(teta);
    const yc = y1 + (y2 - y1) * Math.cos(teta) + (x2 - x1) * Math.sin(teta);

    const x12 = (3 * x1 + x2) / 4;
    const y12 = (3 * y1 + y2) / 4;

    const x1c = (3 * x1 + xc) / 4;
    const y1c = (3 * y1 + yc) / 4;

    const xAngle = x1 + (x12 - x1) * Math.cos(180) - (y12 - y1) * Math.sin(180);
    const yAngle = y1 + (y12 - y1) * Math.cos(180) + (x12 - x1) * Math.sin(180);

    return (
      <G onPress={toggleSelect}>
        <Text
          fill={colors.white}
          stroke={colors.title}
          fontSize="20"
          fontWeight="bold"
          x={xAngle}
          y={yAngle}
          textAnchor="middle">
          {teta}º
        </Text>

        <Line
          x1={x12}
          y1={y12}
          x2={x1c}
          y2={y1c}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        <Line
          x1={x1}
          y1={y1}
          x2={xc}
          y2={yc}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </G>
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
