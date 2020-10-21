import React, {Component} from 'react';
import {View, StyleSheet, Animated, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Line, Path, Text, G} from 'react-native-svg';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import EditPoint from '../editShape/EditPoint';

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
  angleBetweenThreePoints(point1, point2, point3) {
    const ab = {x: point2.x - point1.x, y: point2.y - point1.y};
    const cb = {x: point2.x - point3.x, y: point2.y - point3.y};

    const dot = ab.x * cb.x + ab.y * cb.y; // dot product
    const cross = ab.x * cb.y - ab.y * cb.x; // cross product

    const alpha = Math.atan2(cross, dot);

    return Math.abs(Math.floor((alpha * 180) / Math.PI + 0.5));
  }
  drawView() {
    const {
      strokeWidth,
      strokeColor,
      startPoint,
      endPoint,
      thirdPoint,
      toggleSelect,
      editShape,
      id,
      isSelected,
      endEditShape,
    } = this.props;

    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;
    const {x: x3, y: y3} = thirdPoint;

    const teta = this.angleBetweenThreePoints(endPoint, startPoint, thirdPoint);

    const x12 = (3 * x1 + x2) / 4;
    const y12 = (3 * y1 + y2) / 4;

    const x1c = (3 * x1 + x3) / 4;
    const y1c = (3 * y1 + y3) / 4;

    return (
      <G>
        <EditPoint
          startPoint={startPoint}
          endPoint={endPoint}
          thirdPoint={thirdPoint}
          id={id}
          positionZone={startPoint}
          endEditShape={endEditShape}
          toggleSelect={toggleSelect}
          element={(panResponder) => (
            <Line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              {...panResponder}
            />
          )}
          editShape={isSelected && editShape}
        />

        <EditPoint
          startPoint={startPoint}
          endPoint={endPoint}
          thirdPoint={thirdPoint}
          id={id}
          positionZone={startPoint}
          toggleSelect={toggleSelect}
          endEditShape={endEditShape}
          element={(panResponder) => (
            <Line
              x1={x1}
              y1={y1}
              x2={x3}
              y2={y3}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              {...panResponder}
            />
          )}
          editShape={isSelected && editShape}
        />

        <Line
          x1={x12}
          y1={y12}
          x2={x1c}
          y2={y1c}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        <EditPoint
          startPoint={startPoint}
          id={id}
          positionZone={startPoint}
          toggleSelect={toggleSelect}
          endEditShape={endEditShape}
          element={(panResponder) => (
            <Text
              fill={colors.white}
              stroke={colors.white}
              fontSize="15"
              fontWeight="bold"
              x={x1}
              {...panResponder}
              y={y1}
              textAnchor="middle">
              {teta.toFixed(0)}º
            </Text>
          )}
          editShape={isSelected && editShape}
        />

        {isSelected && (
          <EditPoint
            endPoint={endPoint}
            positionZone={endPoint}
            id={id}
            endEditShape={endEditShape}
            strokeColor={strokeColor}
            editShape={editShape}
            backgroundColor={colors.secondary}
          />
        )}

        {isSelected && (
          <EditPoint
            thirdPoint={thirdPoint}
            positionZone={thirdPoint}
            id={id}
            endEditShape={endEditShape}
            strokeColor={strokeColor}
            editShape={editShape}
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

const styles = StyleSheet.create({});

const mapStateToProps = (state, props) => {
  return {};
};

export default connect(
  mapStateToProps,
  {},
)(DrawSraightLine);
