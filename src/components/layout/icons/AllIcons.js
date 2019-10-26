import React, { Component } from 'react';
import Icons from './icons'
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

export default class AllIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
      }
    icon(type,icon) {
      if (type =='moon') {
        return <Icons name={icon} color={this.props.color} size={this.props.size} />
      } else if (type == 'font') {
        return <FontIcon name={icon} color={this.props.color} size={this.props.size} />
      } else if (type == 'mat') {
        return <MatIcon name={icon} color={this.props.color} size={this.props.size} />
      }
      return null
    } 
  render() {
    return this.icon(this.props.type,this.props.name)
  }
}


