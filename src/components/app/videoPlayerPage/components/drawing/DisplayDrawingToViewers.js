import React, {Component} from 'react';
import Svg, {Polyline, Line, Circle, Rect} from 'react-native-svg';
import {dimensionRectangle} from '../../../../functions/videoManagement';

export default class DisplayDraingToViewers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  polyline = (draw) => {
    const {data} = draw;
    let arrayDots = data;
    const {widthDrawView, heightDrawView} = this.props;

    arrayDots = arrayDots.map((dot) => {
      let Xsource = Number(dot.split(',')[0]);
      let Ysource = Number(dot.split(',')[1]);
      const Xtarget = widthDrawView * Xsource;
      const Ytarget = heightDrawView * Ysource;
      return Xtarget + ',' + Ytarget;
    });
    let dots = arrayDots.toString();
    dots = dots.replace(',', ' ');
    return (
      <Polyline
        points={dots}
        fill="none"
        stroke={draw.color}
        strokeWidth={draw.width}
      />
    );
  };
  line = (draw) => {
    const {startPoint, endPoint} = draw.data;
    const {width, color} = draw;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;
    return (
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
      />
    );
  };
  circle = (draw) => {
    const {startPoint, endPoint} = draw.data;
    const {width, color} = draw;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;
    let radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    if (!radius) radius = 0;
    return (
      <Circle
        cx={x1}
        cy={y1}
        r={radius}
        stroke={color}
        strokeWidth={width}
        fill="transparent"
      />
    );
  };
  rectangle = (draw) => {
    const {startPoint, endPoint} = draw.data;
    const {width: strokeWidth, color} = draw;
    const {x: x1, y: y1} = startPoint;
    const {height, width} = dimensionRectangle({startPoint, endPoint});
    return (
      <Rect
        x={x1}
        y={y1}
        height={height}
        width={width}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
    );
  };
  draw(draw, i) {
    const {widthDrawView, heightDrawView} = this.props;
    const {type} = draw;

    return (
      <Svg
        key={draw.idSketch}
        height={heightDrawView}
        width={widthDrawView}
        style={[{position: 'absolute', zIndex: -2}]}>
        {type === 'straight'
          ? this.line(draw)
          : type === 'circle'
          ? this.circle(draw)
          : type === 'rectangle'
          ? this.rectangle(draw)
          : this.polyline(draw)}
      </Svg>
    );
  }
  viewDrawings(drawings) {
    if (!drawings) return null;
    return Object.values(drawings).map((draw, i) => this.draw(draw, i));
  }
  render() {
    const {drawings} = this.props;
    return this.viewDrawings(drawings);
  }
}
