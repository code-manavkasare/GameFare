import React, {Component} from 'react';
import Svg, {Polyline} from 'react-native-svg';

export default class DisplayDraingToViewers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  draw(draw, i) {
    let arrayDots = draw.data;
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
      <Svg
        key={draw.idSketch}
        height={heightDrawView}
        width={widthDrawView}
        style={[{position: 'absolute', zIndex: -2}]}>
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
