import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';

import PhoneFields from './elementsLogin/PhoneFields';
import {marginTopApp} from '../style/sizes';

import styleApp from '../style/style';
import HeaderBackButton from '../layout/headers/HeaderBackButton';
import colors from '../style/colors';

export default class LoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {}
  phone() {
    const {params} = this.props.route;
    let country = false;
    if (params) country = params.country;
    return (
      <View style={{...styleApp.marginView, marginTop: marginTopApp + 80}}>
        <Text
          style={[
            styleApp.title,
            {marginBottom: 20, fontSize: 21, marginTop: 0},
          ]}>
          Enter your phone number
        </Text>
        <PhoneFields
          country={
            country
              ? country
              : {name: 'United States', callingCode: '1', code: 'US'}
          }
          navigate={this.navigate.bind(this)}
        />
      </View>
    );
  }
  navigate(page, data) {
    this.props.navigation.navigate(page, data);
  }
  render() {
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="times"
          sizeIcon1={21}
          icon2={null}
          clickButton1={() => navigation.dangerouslyGetParent().pop()}
        />
        {this.phone()}
      </View>
    );
  }
}
