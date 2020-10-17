import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import Svg, {Line, Path} from 'react-native-svg';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';

class DrawSraightLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawing: false,
      startPoint: {},
      endPoint: {},
      thirdPoint: {},
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
    const {strokeWidth, strokeColor, startPoint, endPoint, style} = this.props;

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
      <Animated.View style={style}>
        <View
          style={{
            ...styleApp.center,
            position: 'absolute',
            zIndex: 30,
            top: yAngle,
            left: xAngle,
            borderRadius: 5,
            height: 30,
            width: 30,
            backgroundColor: colors.title,
          }}>
          <Text
            style={[styleApp.textBold, {color: colors.white, fontSize: 11}]}>
            {teta}º
          </Text>
        </View>

        {/* <Path
          d="M100 378.5" // put your path here
          fill="blue"
          stroke="blue"
        /> */}

        <Svg
          height={style.height}
          width={style.width}
          style={{
            position: 'absolute',
          }}>
          <Line
            x1={x12}
            y1={y12}
            x2={x1c}
            y2={y1c}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Svg>

        <Svg height={style.height} width={style.width}>
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
        </Svg>
      </Animated.View>
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
