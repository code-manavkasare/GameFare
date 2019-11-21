import React, {Component,createRef} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
    Animated
} from 'react-native';
import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView2'
import sizes from '../style/sizes'
import styleApp from '../style/style'
import VerifyFields from './elementsLogin/VerifyFields'
import {connect} from 'react-redux';
import AllIcons from '../layout/icons/AllIcons'
import BackButton from '../layout/buttons/BackButton'
import HeaderBackButton from '../layout/headers/HeaderBackButton'

const { height, width } = Dimensions.get('screen')

export default class Verify extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  componentDidMount() {
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={''}
        inputRange={[5,10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1='arrow-left'
        icon2={null}
        clickButton1={() => this.props.navigation.navigate('Phone')} 
        />

        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => <VerifyFields pageFrom={this.props.navigation.getParam('pageFrom')} navigate={(val,data) => this.props.navigation.navigate(val,data)}  params={this.props.navigation.getParam('data')}/>}
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

const styles = StyleSheet.create({

});

