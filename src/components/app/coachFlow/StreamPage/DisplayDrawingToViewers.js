import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';
const {height, width} = Dimensions.get('screen');

import AllIcons from '../../../layout/icons/AllIcons';
import {Col, Row} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

import Svg, {Polyline} from 'react-native-svg';

class DisplayDraingToViewers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  draw(draw, i) {
    console.log('draw', draw);
    let arrayDots = draw.data;
    console.log('arrayDots', arrayDots);

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
    console.log('dots', arrayDots);
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

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(DisplayDraingToViewers);
