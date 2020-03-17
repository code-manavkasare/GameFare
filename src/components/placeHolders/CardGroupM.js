import React, {Component, PureComponent} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ListView,
  Dimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Col, Row, Grid} from 'react-native-easy-grid';
import colors from '../style/colors';
import sizes from '../style/sizes';
import styleApp from '../style/style';
const {height, width} = Dimensions.get('screen');

export default class PlaceHolder extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={[styles.content]}>
        <View style={styleApp.marginView}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={[colors.placeHolder1, colors.placeHolder2]}
            style={{
              height: 125,
              borderTopLeftRadius: 5,
              width: '100%',
              borderTopRightRadius: 5,
            }}
          />
          <Row style={{marginTop: 10}}>
            <Col size={80} style={styleApp.center2}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[colors.placeHolder1, colors.placeHolder2]}
                style={{height: 15, borderRadius: 7, width: '80%'}}
              />
            </Col>
          </Row>
          <Row style={{marginTop: 10, marginBottom: 10}}>
            <Col size={80} style={styleApp.center2}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[colors.placeHolder1, colors.placeHolder2]}
                style={{height: 15, borderRadius: 7, width: '80%'}}
              />
            </Col>
          </Row>

          <Row>
            <Col size={10} style={[styleApp.center2]}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[colors.placeHolder1, colors.placeHolder2]}
                style={{
                  height: 25,
                  borderRadius: 12.5,
                  // marginTop: 10,
                  width: 25,
                }}
              />
            </Col>
            <Col size={80} style={[styleApp.center2]}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[colors.placeHolder1, colors.placeHolder2]}
                style={{
                  height: 15,
                  borderRadius: 7,
                  marginTop: 10,
                  width: '70%',
                }}
              />
            </Col>
          </Row>
          <View style={[styleApp.divider2]} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    // height:height,
    // width:'100%',
    // //position:'absolute',
    backgroundColor: 'white',
    paddingTop: 20,
    //borderTopWidth:0.3,
    //borderRightWidth:0.3,
    borderColor: colors.borderColor,
    width: width,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2: {
    //alignItems: 'center',
    justifyContent: 'center',
  },
});
