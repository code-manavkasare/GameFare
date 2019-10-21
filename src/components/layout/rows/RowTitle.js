import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import {Grid,Row,Col} from 'react-native-easy-grid';

import {Fonts} from '../../../utils/Font'
import colors from '../colors'

const { height, width } = Dimensions.get('screen')

export default class HeaderPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.componentWillMount = this.componentWillMount.bind(this);
      }
    componentWillMount(){
    }
  render() {
    return ( 
      <Text style={[styles.title,this.props.styleTitle]}>{this.props.text}</Text>
    );
  }
}

const styles = StyleSheet.create({
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    justifyContent: 'center',
  },
  title:{
    fontSize:24,
    fontFamily: 'OpenSans-SemiBold',
    color:colors.title,
  },
  buttonClose:{
    alignItems: 'center',
    justifyContent: 'center',
    width:60,
    // backgroundColor:'red',
    height:25,
    position:'absolute',
    right:10,
    top:13,
  },
  textButtonClose:{
      fontSize:15,
      color:'#4B4B4B',
      fontFamily: Fonts.MarkOT,
  },
});

