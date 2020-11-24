import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Rect, G} from 'react-native-svg';

import colors from '../../../../../style/colors';
import EditPoint from '../editShape/EditPoint';
import {dimensionRectangle} from '../../../../../functions/videoManagement';

export default class DrawSraightLine extends Component {
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
      editShape,
      id,
      endEditShape,
    } = this.props;
    const {x: x1, y: y1} = startPoint;
    const {height, width} = dimensionRectangle({startPoint, endPoint});
    return (
      <G>
        <EditPoint
          startPoint={startPoint}
          endPoint={endPoint}
          positionZone={{x: endPoint.x, y: endPoint.y}}
          id={id}
          toggleSelect={toggleSelect}
          endEditShape={endEditShape}
          element={(panResponder) => (
            <Rect
              x={x1}
              y={y1}
              height={height}
              width={width}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill={isSelected ? colors.primary + '70' : 'transparent'}
              {...panResponder}
            />
          )}
          editShape={isSelected && editShape}
        />

        {isSelected ? (
          <EditPoint
            startPoint={startPoint}
            positionZone={{x: startPoint.x, y: startPoint.y}}
            id={id}
            strokeColor={strokeColor}
            editShape={editShape}
            endEditShape={endEditShape}
            backgroundColor={colors.secondary}
          />
        ) : null}
      </G>
    );
  }
  render() {
    return this.drawView();
  }
}
