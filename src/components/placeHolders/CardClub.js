import React, {Component, PureComponent} from 'react';
import {} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Col, Row, Grid} from 'react-native-easy-grid';
import colors from '../style/colors';

export default class PlaceHolder extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const {style} = this.props;
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={[colors.placeHolder1, colors.placeHolder2]}
        style={style}
      />
    );
  }
}
