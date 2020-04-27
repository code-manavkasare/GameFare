import React, {Component} from 'react';
import {View,  Animated} from 'react-native';

import ScrollView from '../layout/scrollViews/ScrollView';
import sizes from '../style/sizes';
import CompleteFields from './elementsLogin/CompleteFields';

import styleApp from '../style/style';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

export default class Complete extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  render() {
    const {navigation, route} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => navigation.navigate('Phone')}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => (
            <CompleteFields
              dismiss={() => navigation.dangerouslyGetParent().pop()}
              navigate={(val, data) => navigation.navigate(val, data)}
              params={route.params.data}
            />
          )}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}
