import React, {Component, createRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import ScrollView from '../layout/scrollViews/ScrollView';
import {heightHeaderHome} from '../style/sizes';
import styleApp from '../style/style';
import VerifyFields from './elementsLogin/VerifyFields';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

export default class Verify extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.componentDidMount = this.componentDidMount.bind(this);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {}
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
          icon1="chevron-left"
          sizeIcon1={21}
          clickButton1={() => navigation.goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => (
            <VerifyFields
              close={() => navigation.dangerouslyGetParent().pop()}
              navigate={(val, data) => navigation.navigate(val, data)}
              params={route.params.data}
            />
          )}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={heightHeaderHome}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}
