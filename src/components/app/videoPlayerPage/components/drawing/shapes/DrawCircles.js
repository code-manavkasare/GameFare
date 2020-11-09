import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Alert} from 'react-native';

import Svg, {Circle, G} from 'react-native-svg';
import EditPoint from '../editShape/EditPoint';
import colors from '../../../../../style/colors';

export default class DrawSraightLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawing: false,
      startPoint: {},
      endPoint: {},
    };
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
      id,
      editShape,
      endEditShape,
    } = this.props;

    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;

    let radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    return (
      <G>
        <EditPoint
          startPoint={startPoint}
          endPoint={endPoint}
          positionZone={{x: endPoint.x, y: endPoint.y}}
          id={id}
          endEditShape={endEditShape}
          toggleSelect={toggleSelect}
          element={(panResponder) => (
            <Circle
              cx={x1}
              cy={y1}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill={isSelected ? colors.primary + '40' : 'transparent'}
              {...panResponder}
            />
          )}
          editShape={isSelected && editShape}
        />

        {isSelected && (
          <EditPoint
            endPoint={endPoint}
            positionZone={{x: endPoint.x, y: endPoint.y}}
            id={id}
            strokeColor={strokeColor}
            editShape={editShape}
            endEditShape={endEditShape}
            backgroundColor={colors.secondary}
          />
        )}
      </G>
    );
  }
  render() {
    return this.drawView();
  }
}
