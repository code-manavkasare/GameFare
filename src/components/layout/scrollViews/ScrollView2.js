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
import colors from '../../style/colors';
import styleApp from '../../style/style'
import ButtonColor from '../Views/Button'
import AllIcons from '../icons/AllIcons'

const { height, width } = Dimensions.get('screen')

export default class ScrollViewPage extends PureComponent {
    constructor(props) {
        super(props);
        this.state={
          refreshing:false
        }
        this.componentDidMount = this.componentDidMount.bind(this)
        this.AnimatedHeaderValue = new Animated.Value(0);
      }
      getAnimateHeader() {
        return this.AnimatedHeaderValue
      }
      componentDidMount() {
        this.props.onRef(this)
      }
      styleScrollView() {
        return {
          paddingTop:this.props.marginTop,
          marginBottom:this.props.marginBottomScrollView!=undefined?this.props.marginBottomScrollView:0,
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
              tintColor={this.props.colorRefresh!=undefined?this.props.colorRefresh:colors.title}
              refreshing={this.state.refreshing}
              onRefresh={()=>this.refresh()} size={'small'} />
          )
        }
        return null
      }
  render() {
    const AnimateHeaderBackground = this.AnimatedHeaderValue.interpolate(
      {
          inputRange: [ 0, 60 ],
          outputRange: [ 'transparent', 'white' ],
          extrapolate: 'clamp'
    });
    const AnimateHeaderBorder = this.AnimatedHeaderValue.interpolate(
      {
          inputRange: [ 30, 60 ],
          outputRange: [ 'transparent', colors.off ],
          extrapolate: 'clamp'
    });
    const AnimateColorIcon = this.AnimatedHeaderValue.interpolate(
      {
          inputRange: [ 0, 60 ],
          outputRange: [ this.props.initialColorIcon, colors.title ],
          extrapolate: 'clamp'
    });
    return ( 
        <View>
          {
          this.props.header != undefined?
          <Animated.View style={[styleApp.center,{borderColor:AnimateHeaderBorder,height:46,width:46,borderRadius:23,borderWidth:1,backgroundColor:AnimateHeaderBackground,position:'absolute',top:15,right:20,zIndex:40}]} >
            <ButtonColor view={() => {
              return <AllIcons name={this.props.icon1} color={AnimateColorIcon} size={18} type='font' />
            }}
            click={() => this.props.clickButton1()}
            color={'transparent'}
            style={[styleApp.center,{height:46,width:46,borderRadius:23,backgroundColor:AnimateHeaderBackground}]}
            onPressColor={'transparent'}
            />
          </Animated.View>
          :null
          }
        <KeyboardAwareScrollView

          enableOnAndroid={true} 
          extraScrollHeight={30}
          keyboardOpeningTime={120} 
          bounces={true}
          enableResetScrollToCoords={false}
          refreshControl={this.refreshControl()}
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode = {'none'}
          stickyHeaderIndices={this.props.stickyHeaderIndices}

          extraHeight={100} 
          showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator}
          scrollEventThrottle ={16} 
          onScroll = { 
            Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.props.AnimatedHeaderValue?this.props.AnimatedHeaderValue:this.AnimatedHeaderValue }}}]
            )}
          style={this.styleScrollView()}
        >
          

          {this.props.contentScrollView()}

          <View style={{height:this.props.offsetBottom}}/>

        </KeyboardAwareScrollView>
        </View>
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

