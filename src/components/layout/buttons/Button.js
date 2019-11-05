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

const { height, width } = Dimensions.get('screen')

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.AnimatedButton = new Animated.Value(1);
  }
  click() {
    this.props.click()
  }
  widthButton() {
    if(this.props.width !== undefined) return this.props.width
    return width-40
  }
  styleButton() {
    if (this.props.disabled) return {...styles.buttonSubmit,backgroundColor:'white',...this.props.styleButton}
    if (this.props.styleButton != undefined) return {...styles.buttonSubmit,...this.props.styleButton,backgroundColor:colors[this.props.backgroundColor]}
    return {...styles.buttonSubmit,backgroundColor:colors[this.props.backgroundColor]}
  }
  onPressColor() {
    if (this.props.onPressColor != undefined) return this.props.onPressColor
    return colors.primary2
  }
  styleText() {
    if (this.props.disabled) return {...styles.textButtonOn,...this.props.styleText,color:colors[this.props.backgroundColor]}
    if (this.props.textButton != undefined) return {...styles.textButtonOn,...this.props.textButton}
    return styles.textButtonOn
  }
  render() {  
    return (
      <TouchableHighlight 
        activeOpacity={1} 
        underlayColor={this.onPressColor()}
        style={this.styleButton()} 
        disabled={this.props.disabled}
        onPress={() => this.props.click()} 
      >
          {
          this.props.loader?
          <Loader size={20} color='white'/>
          :
          <Text style={this.styleText()}>{this.props.text}</Text>
          }   
      </TouchableHighlight> 
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
    borderWidth: 1,borderColor:'#eaeaea',
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


