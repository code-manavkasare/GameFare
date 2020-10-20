import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Line, G, Path} from 'react-native-svg';

import colors from '../../../../../style/colors';
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
  pointsNotNull = () => {
    const {startPoint, endPoint} = this.props;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;
    return x1 !== 0 && y1 !== 0 && x2 !== 0 && y2 !== 0;
  };
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
      arrow,
      endEditShape,
      drawing,
    } = this.props;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;

    return (
      <G>
        <EditPoint
          startPoint={startPoint}
          endPoint={endPoint}
          id={id}
          positionZone={startPoint}
          toggleSelect={toggleSelect}
          endEditShape={endEditShape}
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
        {arrow && this.pointsNotNull() && (
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
        )}
        {isSelected && (
          <EditPoint
            endPoint={endPoint}
            endEditShape={endEditShape}
            positionZone={{
              x: arrow ? endPoint.x + 0 : endPoint.x,
              y: arrow ? endPoint.y + 0 : endPoint.y,
            }}
            id={id}
            strokeColor={strokeColor}
            editShape={editShape}
            backgroundColor={colors.secondary + '50'}
          />
        )}
        {isSelected && (
          <EditPoint
            startPoint={startPoint}
            positionZone={{x: startPoint.x, y: startPoint.y}}
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

const styles = StyleSheet.create({});

const mapStateToProps = (state, props) => {
  return {};
};

export default connect(
  mapStateToProps,
  {},
)(DrawSraightLine);
