
import React, { Component,PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Image,
  ScrollView,
  View
} from 'react-native';

import { Col, Row, Grid } from "react-native-easy-grid";
import colors from '../../style/colors'
import Icon from '../../layout/icons/icons'
import AllIcons from '../../layout/icons/AllIcons'
import PlacelHolder from '../../placeHolders/CardEvent.js'
import styleApp from '../../style/style'
import {timing} from '../../animations/animations'

var  { height, width } = Dimensions.get('screen')
import {date,time,timeZone} from '../../layout/date/date'

export default class CardEvent extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        player:false,
        backgroundColorAnimation:new Animated.Value(0),
        loader:false
      };
    }
    entreeFee(entreeFee) {
      if (entreeFee == 0) return 'Free'
      return '$' + entreeFee 
    }

    onPress(val) {
      if (val) return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation,timing(300,100)),
      ]).start()
      return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation,timing(0,100)),
      ]).start()
    }
    click() {
      this.props.openEvent()
    }
    card (color) {
      if (this.state.loader)return <PlacelHolder />
      return this.displayCard(color)
    }
    displayCard(color) {
      return (
        <Animated.View style={[styles.cardList,{backgroundColor:color}]}>
        
        <TouchableOpacity 
          onPress={() => this.click()} 
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          style={{height:'100%',width:width-40,marginLeft:20,paddingTop:15}} 
          activeOpacity={0.7} 
        >

          <Row>
            <Col size={75} style={styleApp.center2}>
              <Text style={styles.title}>{this.props.item.info.name}</Text>
            </Col>
            <Col size={5} style={styleApp.center}>
              {
              !this.props.item.info.public?
              <AllIcons name='lock' color={colors.blue} size={17} type='mat' />
              :null
              }
            </Col>
            <Col size={20} style={styleApp.center3}>
              <View style={styles.viewSport}>
                <Text style={styles.textSport}>{this.props.item.info.sport.charAt(0).toUpperCase() + this.props.item.info.sport.slice(1)}</Text>
              </View>
            </Col>

          </Row>

          <Row style={{marginTop:5,marginBottom:15}}>
            <Col style={[styles.center2,{paddingTop:10,paddingBottom:10}]} size={80}>
              {
              this.props.item.info.public?
              <Row style={{marginBottom:5}}>
                <Col size={10} style={styles.center2}>
                  <AllIcons name="map-marker-alt" size={15} color={colors.grey} type='font' />
                </Col> 
                <Col size={90} style={styles.center2}>
                  <Text style={styles.subtitle}>{this.props.item.location.area}</Text>
                </Col> 
              </Row>
              :null
              }

              <Row style={{paddingBottom:5}}>
                <Col size={10} style={styles.center2}>
                  <AllIcons name="calendar-alt" size={15} color={colors.grey} type='font' />
                </Col> 
                <Col size={90} style={styles.center2}>
                  <Text style={styles.subtitle}>{date(this.props.item.date.start,'ddd, Do MMM')} at {time(this.props.item.date.start,'h:mm a')}</Text>
                </Col> 
              </Row>
            </Col>
            <Col style={styleApp.center3} size={20}>
              <Text style={styles.textPrice}>{this.entreeFee(this.props.item.price.joiningFee)}</Text>
            </Col>
          </Row>

        </TouchableOpacity>

      </Animated.View>
      )
    }

  render() {
    var color = this.state.backgroundColorAnimation.interpolate({
        inputRange: [0, 300],
        outputRange: ['white', colors.off2]
    });
    return (
      this.card(color)
    );
  }
}

const styles = StyleSheet.create({
  cardList:{
    flex:1,
    marginTop:0,
    //width: '48%',
    width:width,
    marginLeft:-20,
    // aspectRatio: 1,
    backgroundColor:'white',  
    borderTopWidth:0.3,
    borderColor:colors.borderColor,
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    //alignItems: 'center',
    justifyContent: 'center',
  },
  viewSport:{
    //position:'absolute',
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    //top:15,
    right:0,
    height:25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
  textPrice:{
    color:colors.primary,
    fontSize:18,
    fontFamily: 'OpenSans-Bold',
  },
  title:{
    color:colors.title,
    fontSize:17,
    fontFamily: 'OpenSans-SemiBold',
  },
  subtitle:{
    color:colors.title,
    fontSize:13,
    fontFamily: 'OpenSans-Light',
  },
});



