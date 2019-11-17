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
        <View style={[styles.content]}>
          
          <Row>
            <Col size={80} style={styles.center2}>
              <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:20,borderRadius:7,marginRight:80,marginTop:0,marginLeft:20}} />
            </Col>
            <Col size={20} style={styles.center2}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:22,borderRadius:7,marginTop:0,width:'70%'}} />
            </Col>
          </Row>
          <Row style={{height:90,marginTop:0,}}>
            <Col size={80} style={[styles.center2,{paddingLeft:15}]}>
              <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:15,borderRadius:7,marginTop:10,width:'70%'}} />
              <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:15,borderRadius:7,marginTop:8,width:'60%'}} />
            </Col>
            <Col size={20} style={styles.center}>
              <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:15,borderRadius:7,width:'40%'}} />
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
    paddingTop:20,
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

