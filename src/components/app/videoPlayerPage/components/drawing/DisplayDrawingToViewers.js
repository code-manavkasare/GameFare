import React, {Component} from 'react';
import Svg, {Polyline, Line, Circle, Rect, G, Path} from 'react-native-svg';
import {dimensionRectangle} from '../../../../functions/videoManagement';
import PinchableBox from '../../../../layout/Views/PinchableBox';

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
  drawObject = (draw) => {
    const {widthDrawView, heightDrawView} = this.props;
    return {
      ...draw,
      data: {
        ...draw.data,
        startPoint: {
          x: draw.data.startPoint.x * widthDrawView,
          y: draw.data.startPoint.y * heightDrawView,
        },
        endPoint: {
          x: draw.data.endPoint.x * widthDrawView,
          y: draw.data.endPoint.y * heightDrawView,
        },
      },
    };
  };
  line = (drawData) => {
    const draw = this.drawObject(drawData);

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
  circle = (drawData) => {
    const draw = this.drawObject(drawData);
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

  angle = (drawData) => {
    const draw = this.drawObject(drawData);
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

  rectangle = (drawData) => {
    const draw = this.drawObject(drawData);

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
  arrow = (drawData) => {
    const draw = this.drawObject(drawData);

    const {startPoint, endPoint} = draw.data;
    const {width, color} = draw;
    const {x: x1, y: y1} = startPoint;
    const {x: x2, y: y2} = endPoint;
    return (
      <G
        rotation={(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI - 135}
        origin={`${x2}, ${y2}`}>
        <Path
          d={`M ${x2 + 4} ${y2 + 4} L ${x2 - 6} ${y2 + 6} L ${x2 - 6} ${y2 -
            4} z`}
          fill={color}
          stroke={color}
        />
      </G>
    );
  };
  draw(draw, i) {
    const {widthDrawView, heightDrawView} = this.props;
    const {type} = draw;
    return (
      <PinchableBox
        styleContainer={{
          height: heightDrawView,
          width: widthDrawView,
          position: 'absolute',
          // backgroundColor: 'red',
          zIndex: -2,
        }}
        onRef={(ref) => (this.PinchableBoxRef = ref)}
        pinchEnable={false}
        scale={1}
        position={{y: 0, x: 0}}
        scaleChange={(val) => console.log('scale change', val)}
        onPinch={(scale) => console.log('onPinch change', scale)}
        onDrag={(pos) => console.log('onDrag change', pos)}
        singleTouch={() => console.log('singleTouch')}
        component={() => (
          <Svg
            key={draw.idSketch}
            height={heightDrawView}
            width={widthDrawView}>
            {type === 'straight' || type === 'arrow'
              ? this.line(draw)
              : type === 'circle'
              ? this.circle(draw)
              : type === 'angle'
              ? this.angle(draw)
              : type === 'rectangle'
              ? this.rectangle(draw)
              : type === 'custom'
              ? this.polyline(draw)
              : null}

            {type === 'arrow' && this.arrow(draw)}
          </Svg>
        )}
      />
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
