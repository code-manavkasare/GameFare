import React, {Component, PureComponent} from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={[colors.placeHolder1, colors.placeHolder2]}
          style={styleApp.fullCardArchive}
        />
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={[colors.placeHolder1, colors.placeHolder2]}
          style={{
            height: 25,
            width: 120,
            borderRadius: 5,
            marginTop: 10,
            marginLeft: '5%',
          }}
        />
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={[colors.placeHolder1, colors.placeHolder2]}
          style={{
            height: 20,
            width: 180,
            borderRadius: 5,
            marginTop: 10,
            marginLeft: '5%',
          }}
        />
      </View>
    );
  }
}
