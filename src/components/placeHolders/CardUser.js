import React, {Component, PureComponent} from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Col, Row, Grid} from 'react-native-easy-grid';
import colors from '../style/colors';
import styleApp from '../style/style';

export default class PlaceHolder extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const {style} = this.props;
    return (
      <View style={style}>
        <Row>
          <Col size={15} style={styleApp.center}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{height: 20, width: 20, borderRadius: 10}}
            />
          </Col>
          <Col size={75} style={styleApp.center2}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{height: 22, borderRadius: 7, marginTop: 0, width: 200}}
            />
          </Col>
        </Row>
      </View>
    );
  }
}
