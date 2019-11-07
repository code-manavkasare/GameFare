import React, { Component,PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ListView,
  Dimensions,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Col, Row, Grid } from "react-native-easy-grid";
import colors from '../style/colors'
import sizes from '../style/sizes'
const { height, width } = Dimensions.get('screen')

export default class PlaceHolder extends PureComponent {
    constructor(props) {
        super(props);
      }
  render() {
    return <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:45,borderRadius:3,marginTop:10,borderWidth:1,borderColor:colors.off}} />;
  }
}

const styles = StyleSheet.create({
  content:{
    // height:height,
    // width:'100%',
    // //position:'absolute',
    // // backgroundColor:'red',
    // zIndex:40,
    // top:0,
    //paddingTop:10,
   // marginLeft:-20,
   // width:width
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    //alignItems: 'center',
    justifyContent: 'center',
  },
});

