
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
import colors from '../../../../style/colors'
import AllIcons from '../../../../layout/icons/AllIcons'
import PlacelHolder from '../../../../placeHolders/CardEvent.js'
import styleApp from '../../../../style/style'
import {timing,native} from '../../../../animations/animations'
import AsyncImage from '../../../../layout/image/AsyncImage'
import FadeInView from 'react-native-fade-in-view';

var  { height, width } = Dimensions.get('screen')
import {date,time,timeZone} from '../../../../layout/date/date'

class CardGroup extends React.Component {
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
      return <FadeInView duration={250}>{this.displayCard(color)}</FadeInView>
    }
    displayCard(color) {
      var sport = Object.values(this.props.sports).filter(sport => sport.value == this.props.item.info.sport)[0]
      return (
        <Animated.View style={[styles.cardList,{backgroundColor:color}]}>
        
        <TouchableOpacity 
          onPress={() => this.click()} 
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          style={{height:'100%',width:'100%',paddingLeft:20,paddingRight:20,paddingTop:30,paddingBottom:20}} 
          activeOpacity={1} 
        >

          <Row>
            <Col size={25} style={styleApp.center2}>
            <AsyncImage style={{width:'100%',height:70,borderRadius:6}} mainImage={this.props.item.pictures[0]} imgInitial={this.props.item.pictures[0]} />
            </Col>
            <Col size={85} style={[styleApp.center2,{paddingLeft:15}]}>
              
              <Row>
                <Col size={75} style={styleApp.center2}>
                  <Text style={styles.title}>{this.props.item.info.name}</Text>
                </Col>
                <Col size={25} style={styleApp.center2}>
                  <View style={[styles.viewSport,{backgroundColor:sport.card.color.backgroundColor}]}>
                    <Text style={[styles.textSport,{color:sport.card.color.color}]}>{this.props.item.info.sport.charAt(0).toUpperCase() + this.props.item.info.sport.slice(1)}</Text>
                  </View>
                </Col>
              </Row>
              {/* <Text style={[styles.subtitle,{fontSize:12}]}>{this.props.item.location.address}</Text> */}
              <Text style={[styles.subtitle,{fontSize:12,marginBottom:10,marginTop:5}]}>Created by {this.props.item.organizer.name}</Text>
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
    borderTopWidth:0.3,
    borderRightWidth:0.3,
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
    fontSize:11,
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

export default connect(mapStateToProps,{})(CardGroup);



