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
import {timing} from '../../animations/animations'
import styleApp from '../../style/style'
const { height, width } = Dimensions.get('screen')

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColorAnimation:new Animated.Value(0)
    };
    this.AnimatedButton = new Animated.Value(1);
  }
  onPress(val) {
    console.log('onPress')
    console.log(val)
    if (val) return Animated.parallel([
      Animated.timing(this.state.backgroundColorAnimation,timing(300,100)),
    ]).start()
    return Animated.parallel([
      Animated.timing(this.state.backgroundColorAnimation,timing(0,100)),
    ]).start()
  }
  render() {  
    var color = this.state.backgroundColorAnimation.interpolate({
      inputRange: [0, 300],
      outputRange: [this.props.color, this.props.onPressColor]
    });
    return (
      <Animated.View style={[this.props.style,{backgroundColor:color}]}>
        <TouchableOpacity 
        activeOpacity={1} 
        style={[styleApp.center,{width:'100%',height:'100%'}]}
        onPressIn={() => this.onPress(true)}
        onPressOut={() => this.onPress(false)}
        onPress={() => this.props.click()} 
      >
        {this.props.view()}
      </TouchableOpacity>
      
      </Animated.View> 
    );
  }
}

const styles = StyleSheet.create({
  buttonSubmit:{
    height:55,
    backgroundColor:colors.primary,
    borderRadius:5,
    width:'100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.3,borderColor:colors.borderColor,
    shadowColor: '#46474B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0,
  },
  textButtonOn:{
    color:'white',
    fontFamily: 'OpenSans-SemiBold',
    fontSize:18,
  },
});


