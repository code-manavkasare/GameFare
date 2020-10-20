import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Line, G, Path, Polyline} from 'react-native-svg';

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
  polyline = ({path, panResponder}) => {
    const {w, h, strokeWidth, strokeColor} = this.props;

    path = path.map(({x, y}) => {
      return x * w + ',' + y * h;
    });
    let dots = path.toString();
    dots = dots.replace(',', ' ');

    return (
      <Polyline
        points={dots}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...panResponder}
      />
    );
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
      path,
      h,
      w,
    } = this.props;
    const pathToModify = path.map((point) => {
      return {x: point.x * w, y: point.y * h};
    });
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;
    console.log('endPoint', endPoint);
    console.log('startPoint', startPoint);
    return (
      <G>
        <EditPoint
          startPoint={startPoint}
          endPoint={endPoint}
          id={id}
          path={pathToModify}
          positionZone={startPoint}
          toggleSelect={toggleSelect}
          element={(panResponder) => this.polyline({path, panResponder})}
          editShape={isSelected && editShape}
          w={w}
          h={h}
        />

        {isSelected && (
          <EditPoint
            endPoint={endPoint}
            startPoint={startPoint}
            positionZone={endPoint}
            id={id}
            path={pathToModify}
            strokeColor={strokeColor}
            editShape={editShape}
            backgroundColor={colors.secondary + '50'}
            w={w}
            h={h}
          />
        )}
        {isSelected && (
          <EditPoint
            startPoint={startPoint}
            endPoint={endPoint}
            positionZone={startPoint}
            id={id}
            path={pathToModify}
            strokeColor={strokeColor}
            editShape={editShape}
            backgroundColor={colors.secondary}
            w={w}
            h={h}
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
