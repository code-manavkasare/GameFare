import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Svg, {Line} from 'react-native-svg';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

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
    const {drawing, startPoint, endPoint, thirdPoint} = this.state;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;
    ///const {x: x3, y: y3} = thirdPoint;
    const {style} = this.props;
    const lengthAB = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const teta = 45;
    //console.log('lengthAB', lengthAB);
    const xc = x1 + (x2 - x1) * Math.cos(teta) - (y2 - y1) * Math.sin(teta);
    const yc = y1 + (y2 - y1) * Math.cos(teta) + (x2 - x1) * Math.sin(teta);
    console.log('xc', xc);
    console.log('yc', yc);
    console.log('x1y1', x1, y1);
    console.log('x2y2', x2, y2);
    const x12 = (x1 + x2) / 2;
    const y12 = (y1 + y2) / 2;

    const x1c = (x1 + xc) / 2;
    const y1c = (y1 + yc) / 2;

    const xAngle = x1 + (x12 - x1) * Math.cos(180) - (y12 - y1) * Math.sin(180);
    const yAngle = y1 + (y12 - y1) * Math.cos(180) + (x12 - x1) * Math.sin(180);
    console.log('x12', x12, y12);
    return (
      <PanGestureHandler
        style={style}
        onGestureEvent={this.onPanGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View style={style}>
          {drawing && (
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
                style={[
                  styleApp.textBold,
                  {color: colors.white, fontSize: 11},
                ]}>
                {teta}º
              </Text>
            </View>
          )}
          {drawing && (
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
          )}
          <Svg height={style.height} width={style.width}>
            {drawing && (
              <Line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            )}

            {drawing && (
              <Line
                x1={x1}
                y1={y1}
                x2={xc}
                y2={yc}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
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
