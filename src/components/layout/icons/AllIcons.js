import React, {Component} from 'react';
import {Animated, Image} from 'react-native';
import {bool, number, object, oneOfType, string} from 'prop-types';

import Reanimated from 'react-native-reanimated';

import Icons from './icons';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);
const AnimatedMoonIcon = Animated.createAnimatedComponent(Icons);
const AnimatedMatIcon = Animated.createAnimatedComponent(MatIcon);
const ReanimatedFontIcon = Reanimated.createAnimatedComponent(FontIcon);
const ReanimatedMoonIcon = Reanimated.createAnimatedComponent(Icons);
const ReanimatedMatIcon = Reanimated.createAnimatedComponent(MatIcon);

export default class AllIcon extends Component {
  static propTypes = {
    name: string.isRequired,
    color: oneOfType([string, object]),
    size: number,
    font: string,
    backgroundColor: string,
    solid: bool,
    reanimated: bool,
    style: object,
  };

  static defaultProps = {
    solid: false,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }
  icon(type, icon) {
    const {backgroundColor, color, solid, size, style, reanimated} = this.props;
    if (type === 'moon') {
      return reanimated ? (
        <ReanimatedMoonIcon
          name={icon}
          color={color}
          size={size}
          style={style}
        />
      ) : (
        <AnimatedMoonIcon name={icon} color={color} size={size} style={style} />
      );
    } else if (type === 'font') {
      if (reanimated) {
        return (
          <ReanimatedFontIcon
            name={icon}
            color={color}
            size={size}
            style={{...style, backgroundColor: backgroundColor}}
            solid={solid}
          />
        );
      } else {
        return (
          <AnimatedIcon
            name={icon}
            color={color}
            size={size}
            style={{...style, backgroundColor: backgroundColor}}
            solid={solid}
          />
        );
      }
    } else if (type === 'mat') {
      return reanimated ? (
        <ReanimatedMatIcon name={icon} color={color} size={size} />
      ) : (
        <AnimatedMatIcon name={icon} color={color} size={size} />
      );
    } else if (type === 'file') {
      return (
        <Image source={icon} style={{height: size, width: size, ...style}} />
      );
    }
    return null;
  }
  render() {
    return this.icon(this.props.type, this.props.name);
  }
}
