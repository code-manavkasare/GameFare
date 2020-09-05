import React from 'react';
import {View, Dimensions, Animated, StatusBar} from 'react-native';
import FadeInView from 'react-native-fade-in-view';

import colors from '../style/colors';
import styleApp from '../style/style';

import Loader from '../layout/loaders/Loader';

function loader() {
  const {height, width} = Dimensions.get('screen');
  return (
    <FadeInView duration={200} style={[styleApp.center, {height}]}>
      <View style={[styleApp.center, {width, height: 100, marginBottom: 0}]}>
        <Animated.Image
          style={{width: 40, height: 40, position: 'absolute'}}
          source={require('../../img/logos/logoWhite.png')}
        />
      </View>
      <View style={{position: 'absolute'}}>
        <Loader color={colors.white} size={100} type={2} speed={2.2} />
      </View>
    </FadeInView>
  );
}
export default function initialPage(props) {
  StatusBar.setBarStyle('dark-content', true);
  StatusBar.setHidden(false, 'slide');
  props.navigation.navigate('TabsApp');
  return loader();
}
