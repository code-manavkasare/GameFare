import React, {Component} from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';

import Icons from './icons';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);

export default class AllIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  icon(type, icon) {
    if (type === 'moon') {
      return (
        <Icons
          name={icon}
          color={this.props.color}
          size={this.props.size}
          style={this.props.style}
        />
      );
    } else if (type === 'font') {
      return (
        <AnimatedIcon
          name={icon}
          color={this.props.color}
          size={this.props.size}
        />
      );
    } else if (type === 'mat') {
      return (
        <MatIcon name={icon} color={this.props.color} size={this.props.size} />
      );
    }
    return null;
  }
  render() {
    return this.icon(this.props.type, this.props.name);
  }
}

AllIcon.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  size: PropTypes.number,
  font: PropTypes.string,
};
