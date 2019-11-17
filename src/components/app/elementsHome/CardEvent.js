
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
import {connect} from 'react-redux';

import { Col, Row, Grid } from "react-native-easy-grid";
import colors from '../../style/colors'
import Icon from '../../layout/icons/icons'
import AllIcons from '../../layout/icons/AllIcons'
import PlacelHolder from '../../placeHolders/CardEvent.js'
import styleApp from '../../style/style'
import {timing,native} from '../../animations/animations'

var  { height, width } = Dimensions.get('screen')
import {date,time,timeZone} from '../../layout/date/date'

class CardEvent extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        player:false,
        backgroundColorAnimation:new Animated.Value(0),
        loader:false
      };
      this.scaleCard = new Animated.Value(1);
    }
    entreeFee(entreeFee) {
      if (entreeFee == 0) return 'Free entry'
      return '$' + entreeFee + ' entry fee'
    }

    onPress(val) {
      if (val) return Animated.parallel([
        Animated.spring(this.state.backgroundColorAnimation,timing(300,170)),
        //Animated.spring(this.scaleCard,timing(0.987,100)),
      ]).start()
      return Animated.parallel([
        Animated.spring(this.state.backgroundColorAnimation,timing(0,170)),
        //Animated.spring(this.scaleCard,timing(1,100)),
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
      var sport = Object.values(this.props.sports).filter(sport => sport.value == this.props.item.info.sport)[0]
      if (sport == undefined) return null
      return (
        <Animated.View style={[styles.cardList,{backgroundColor:color}]}>
        
        <TouchableOpacity 
          onPress={() => this.click()} 
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          style={{height:'100%',width:'100%',paddingLeft:20,paddingRight:20,paddingTop:15,paddingBottom:20}} 
          activeOpacity={1} 
        >

          <Row>
            <Col size={70} style={[styleApp.center2,{paddingLeft:0}]}>
              <Text style={[styles.subtitle,{color:colors.primary,fontFamily: 'OpenSans-SemiBold',}]}>{date(this.props.item.date.start,'ddd, Do MMM')} at {time(this.props.item.date.start,'h:mm a')}</Text>
              <Text style={styles.title}>{this.props.item.info.name}</Text>
              {
              this.props.item.info.public?
              <Text style={[styles.subtitle,{marginTop:5}]}>{this.props.item.location.area}</Text>
              :null
              }
              <Text style={[styles.subtitle,{marginTop:5}]}>{this.entreeFee(this.props.item.price.joiningFee)}</Text>
            </Col>
            <Col size={10} style={[styleApp.center4,{paddingTop:3}]}>
              {
              !this.props.item.info.public?
              <AllIcons name='lock' color={colors.blue} size={17} type='mat' />
              :null
              }
            </Col>
            <Col size={20} style={styleApp.center8}>
              <View style={[styles.viewSport,{backgroundColor:sport.card.color.backgroundColor}]}>
                <Text style={[styles.textSport,{color:sport.card.color.color}]}>{this.props.item.info.sport.charAt(0).toUpperCase() + this.props.item.info.sport.slice(1)}</Text>
              </View>
            </Col>

          </Row>

        </TouchableOpacity>

      </Animated.View>
      )
    }

  render() {
    var color = this.state.backgroundColorAnimation.interpolate({
        inputRange: [0, 300],
        outputRange: ['white', colors.off]
    });
    return (
      this.card(color)
    );
  }
}

const styles = StyleSheet.create({
  cardList:{
    flex:1,
    width:'100%',
    backgroundColor:'white',  
    // borderTopWidth:0.3,
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
    fontSize:16,
    marginTop:10,
    fontFamily: 'OpenSans-SemiBold',
  },
  title:{
    color:colors.title,
    fontSize:21,marginTop:8,
    marginBottom:5,

    fontFamily: 'OpenSans-SemiBold',
  },
  subtitle:{
    color:colors.subtitle,
    fontSize:14,
    fontFamily: 'OpenSans-Regular',
  },
});


const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
  };
};

export default connect(mapStateToProps,{})(CardEvent);



