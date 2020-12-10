import React, {Component, PureComponent} from 'react';
import {Platform, StyleSheet, Dimensions, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Col, Row, Grid} from 'react-native-easy-grid';
import colors from '../style/colors';
import styleApp from '../style/style';
const {height, width} = Dimensions.get('screen');

export default class PlaceHolder extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const {style} = this.props;
    return (
      <View style={style}>
        <Row>
          <Col size={80} style={styleApp.center2}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{height: 10, borderRadius: 7, marginTop: 0, width: 110}}
            />
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{height: 22, borderRadius: 7, marginTop: 5, width: 200}}
            />
          </Col>
          <Col size={20} style={styleApp.center3}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{height: 35, width: 50, borderRadius: 20}}
            />
          </Col>
        </Row>
      </View>
    );
  }
}
