import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Line, G} from 'react-native-svg';

import colors from '../../../../../style/colors';

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
      isSelected,
    } = this.props;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;

    return (
      <G onPress={toggleSelect}>
        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={isSelected ? 'blue' : strokeColor}
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
