import React, {Component} from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';

import Icons from './icons';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);

export default class AllIcon extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    size: PropTypes.number,
    font: PropTypes.string,
    backgroundColor: PropTypes.string,
    solid: PropTypes.bool,
  };

  static defaultProps = {
    solid: false,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }
  icon(type, icon) {
    const {backgroundColor, color, solid, size, style} = this.props;
    if (type === 'moon') {
      return <Icons name={icon} color={color} size={size} style={style} />;
    } else if (type === 'font') {
      return (
        <AnimatedIcon
          name={icon}
          color={color}
          size={size}
          style={{backgroundColor: backgroundColor}}
          solid={solid}
        />
      );
    } else if (type === 'mat') {
      return <MatIcon name={icon} color={color} size={size} />;
    }
    return null;
  }
  render() {
    return this.icon(this.props.type, this.props.name);
  }
}
