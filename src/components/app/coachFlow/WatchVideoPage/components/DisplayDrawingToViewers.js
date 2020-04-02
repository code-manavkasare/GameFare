import React, {Component} from 'react';
import {Dimensions} from 'react-native';
const {height, width} = Dimensions.get('screen');
import Svg, {Polyline} from 'react-native-svg';

export default class DisplayDraingToViewers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  draw(draw, i) {
    let arrayDots = draw.data;
    const {screenSource} = draw;

    const Rx = width / screenSource.width;
    const Ry = height / screenSource.height;

    arrayDots = arrayDots.map((dot) => {
      let Xsource = Number(dot.split(',')[0]);
      let Ysource = Number(dot.split(',')[1]);
      const Xtarget = Rx * Xsource;
      const Ytarget = Ry * Ysource;
      return Xtarget + ',' + Ytarget;
    });
    let dots = arrayDots.toString();
    dots = dots.replace(',', ' ');
    return (
      <Svg
        key={i}
        height={height}
        width="100%"
        style={{position: 'absolute', zIndex: -2}}>
        <Polyline
          points={dots}
          fill="none"
          stroke={draw.color}
          strokeWidth={draw.width}
        />
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
