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
    return (
        <View style={{width:'100%',height:'100%'}}>
          <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:17,borderRadius:7,marginRight:0,marginTop:5,marginLeft:0,width:'70%'}} />

          <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:20,borderRadius:7,marginRight:0,marginTop:10,marginLeft:0,width:'60%'}} />

          <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:15,borderRadius:7,marginRight:0,marginTop:10,marginLeft:0,width:'82%'}} />
  
          <Row style={{height:30,marginTop:20,}}>
            <Col size={20} style={[styles.center2,{paddingLeft:0}]}>
              <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:30,borderRadius:15,marginTop:10,width:30}} />
            </Col>
            <Col size={80} style={styles.center2}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:30,borderRadius:15,marginTop:10,width:30}} />
            </Col>
          </Row>
        </View>

    );
  }
}

const styles = StyleSheet.create({
  content:{
    // height:height,
    // width:'100%',
    // //position:'absolute',
    backgroundColor:'white',
    paddingTop:10,
    //borderTopWidth:0.3,
    //borderRightWidth:0.3,
    borderColor:colors.borderColor,
    // zIndex:40,
    // top:0,
    //paddingTop:10,
    //marginLeft:-20,
    width:'100%'
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

