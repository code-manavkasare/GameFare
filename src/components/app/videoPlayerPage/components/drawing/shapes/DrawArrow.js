import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import Svg, {Line, Defs, Marker, Path, G} from 'react-native-svg';

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
    const {style} = this.props;

    return (
      <Svg height={style.height} width={style.width}>
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
      </Svg>
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
