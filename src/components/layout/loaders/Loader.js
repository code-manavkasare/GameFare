import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Animated,
  Image,
  Easing,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import colors from '../../style/colors';

export default class Loader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  spinner() {
    const {size, color, type, speed} = this.props;
    //    let spinner = require('../../../img/animations/spinner-blue.json');
    let spinner = require('../../../img/animations/spinner2.json');
    return (
      <LottieView
        source={spinner}
        style={{height: size, width: size}}
        colorFilters={[
          {
            keypath: 'Shape Layer 2',
            color: color,
          },
          {
            keypath: 'Shape Layer 1',
            color: colors.red,
          },
          {
            keypath: 'Ellipse Path 1',
            color: 'red',
          },
        ]}
        speed={speed ? speed : 2.5}
        autoPlay
        loop
      />
    );
  }
  render() {
    return this.spinner();
  }
}
