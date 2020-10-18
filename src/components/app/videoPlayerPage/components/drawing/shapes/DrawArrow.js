import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Line, Path, G} from 'react-native-svg';

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
    const {style} = this.props;

    return (
      <G height={style.height} width={style.width} onPress={toggleSelect}>
        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        <G
          rotation={(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI - 135}
          origin={`${x2}, ${y2}`}>
          <Path
            d={`M ${x2 + 4} ${y2 + 4} L ${x2 - 6} ${y2 + 6} L ${x2 - 6} ${y2 -
              4} z`}
            fill={strokeColor}
            stroke={strokeColor}
          />
        </G>
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
