import React, { Component,PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const { height, width } = Dimensions.get('screen')

export default class ScrollViewPage extends PureComponent {
    constructor(props) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this)
      }
      
      componentDidMount() {
        this.props.onRef(this)
      }
      styleScrollView() {
        return {
          marginTop:this.props.marginTop
        }
      }
      styleInsideView() {
        if (this.props.fullWidth) return {paddingTop:0}
        return {marginLeft:20,width:width-40,paddingTop:20}
      }
  render() {

    return ( 
        <KeyboardAwareScrollView

          enableOnAndroid={true} 
          extraScrollHeight={30}
          keyboardOpeningTime={120} 
          enableResetScrollToCoords={false}

          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode = {'none'}


          extraHeight={100} 
          showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator}
          scrollEventThrottle ={16} 
          onScroll = { 
            Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.props.AnimatedHeaderValue==undefined?this.AnimatedHeaderValue:this.props.AnimatedHeaderValue }}}]
            )}

          // style={}
          style={this.styleScrollView()}
        >
          <View style={this.styleInsideView()}>
          {this.props.contentScrollView()}
          </View>

          <View style={{height:this.props.offsetBottom}}/>

        </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  content:{
    height:height,
    width:width,
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    justifyContent: 'center',
  },
});

