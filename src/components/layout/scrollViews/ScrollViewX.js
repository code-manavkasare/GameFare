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
  Image,
  RefreshControl,
} from 'react-native';
import NavigationService from '../../../../NavigationService'

import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import FadeInView from 'react-native-fade-in-view';


import PlaceHolder from '../../placeHolders/CardEvent'
import CardEvent from '../../app/elementsHome/CardEventSM'
import Button from '../../layout/Views/Button'


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
    console.log('render scrollview x')
    console.log(this.props.events)
    console.log(Object.values(this.props.events).length)
    return ( 
      <ScrollView horizontal={true}  showsHorizontalScrollIndicator={false} style={{marginLeft:0,height:this.props.height,width:width,paddingLeft:20,paddingRight:20,paddingTop:5,flex:1,paddingBottom:0}}>
      {
      this.props.loader?
      [0,1,2,3].map((event,i) => (
        <View key={i} style={[styles.cardSport,styleApp.center,{backgroundColor:'white'}]} >
          <PlaceHolder />
        </View>
      ))
      :Object.values(this.props.events).length == 0?
      <Button view={() => {
        return (
          <View style={[styleApp.center2,{height:50,}]}>
            {/* <Image source={require('../../../img/images/smartphone.png')} style={{width:100,height:100,marginBottom:10}} /> */}

            <Text style={[styleApp.text,{marginTop:5,fontSize:12}]}>You haven't joined any event yet.</Text>
          </View>
        )
      }} 
      click={() => console.log('click')}
      color='white'
      style={[styleApp.center,{backgroundColor:colors.off2,borderWidth:0,borderColor:colors.borderColor,width:width-40,height:55}]}
      onPressColor={colors.off}
      />
      :
      Object.values(this.props.events).map((event,i) => (
        <CardEvent userCard={false} key={i} loadData={true} homePage={true} openEvent={(event) => this.props.openEvent(event)} item={event}/>
      ))

      }
      <View style={{width:30}}/>
    </ScrollView>  
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
  cardSport:{
    backgroundColor:'red',
    shadowColor: '#46474B',
      shadowOffset: { width: 2, height: 0 },
      shadowRadius: 20,
      shadowOpacity: 0.3,
    marginRight:0,
    overflow:'hidden',
    height:170,
    marginRight:10,
    borderRadius:10,
    borderWidth:0.3,
    borderColor:colors.borderColor,
    width:220
  }
});

