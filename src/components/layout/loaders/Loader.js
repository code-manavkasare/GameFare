import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Animated,
  Image,
  Easing,
  TouchableOpacity
} from 'react-native';
import {native} from '../../animations/animations'

export default class Loader extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.animatedSpin = new Animated.Value(0)
        this.componentWillMount = this.componentWillMount.bind(this);
      }
    componentWillMount(){
        this.annimate()
    }
    annimate () {
        Animated.timing(this.animatedSpin, {
            toValue: 1,
            duration: 17000,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start()
    }
    spinner(color,spin) {
      if (color =='white') {
        return <Animated.Image style={[{width:this.props.size,height:this.props.size}, {transform: [{rotate: spin}]}]} source={require('../../../img/spinners/spinnerWhite.png')} />
      } else if (color == 'primary') {
        return <Animated.Image style={[{width:this.props.size,height:this.props.size}, {transform: [{rotate: spin}]}]} source={require('../../../img/spinners/spinnerPrimary.png')} />
      }
    } 
  render() {
    const spin = this.animatedSpin.interpolate({
        inputRange: [0,1],
        outputRange: ['0deg','7800deg']
    })
    return this.spinner(this.props.color,spin)
  }
}


