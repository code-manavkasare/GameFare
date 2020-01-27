import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Dimensions,
  Easing,
  Animated,
  TouchableHighlight,
  View
} from 'react-native';
import colors from '../../style/colors'
import Loader from '../loaders/Loader'
import AllIcons from '../icons/AllIcons'

const { height, width } = Dimensions.get('screen')

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  styleButton() {
    return {
      width:50,height:47,
      alignItems: 'center',
      justifyContent: 'center',
      // backgroundColor:'blue'
    }
  }
  render() { 
    return (
      <TouchableOpacity
        activeOpacity={0.4} 
        style={this.styleButton()} 
        onPress={() => this.props.click()} 
      >
          <AllIcons name={this.props.name} color={this.props.color?this.props.color:'white'} type={this.props.type} size={this.props.size?this.props.size:25} />
      </TouchableOpacity> 
    );
  }
}

const styles = StyleSheet.create({

});


