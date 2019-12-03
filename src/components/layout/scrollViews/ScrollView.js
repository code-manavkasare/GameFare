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
  RefreshControl,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const { height, width } = Dimensions.get('screen')

export default class ScrollViewPage extends PureComponent {
    constructor(props) {
        super(props);
        this.state={
          refreshing:false
        }
        this.componentDidMount = this.componentDidMount.bind(this)
      }
      
      componentDidMount() {
        this.props.onRef(this)
      }
      styleScrollView() {
        return {
          marginTop:this.props.marginTop,
          
        }
      }
      styleInsideView() {
        if (this.props.fullWidth) return {paddingTop:0}
        return {marginLeft:20,width:width-40,paddingTop:20}
      }
      async refresh() {
        this.setState({refreshing:true})
        await this.props.refresh()
        this.setState({refreshing:false})
      }
      refreshControl(){
        if (this.props.refreshControl) {
          return (
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={()=>this.refresh()} />
          )
        }
        return null
      }
  render() {

    return ( 
        <KeyboardAwareScrollView

          enableOnAndroid={true} 
          extraScrollHeight={30}
          keyboardOpeningTime={120} 
          enableResetScrollToCoords={false}
          refreshControl={this.refreshControl()}
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
     
          {this.props.contentScrollView()}
       

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

