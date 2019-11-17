
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
// import {Fonts} from '../../../../utils/Font'
import colors from '../../../style/colors'
import {timing} from '../../../animations/animations'
import PlacelHolder from '../../../placeHolders/CardEvent'
import Icon from '../../../layout/icons/icons'
import AllIcons from '../../../layout/icons/AllIcons'

import styleApp from '../../../style/style'
import NavigationService from '../../../../../NavigationService'
import AsyncImage from '../../../layout/image/AsyncImage'
import {indexEvents} from '../../../database/algolia'
import FadeInView from 'react-native-fade-in-view';

var  { height, width } = Dimensions.get('screen')
import {date,time,timeZone} from '../../../layout/date/date'

class CardEvent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        player:false,
        backgroundColorAnimation:new Animated.Value(0),
        loader:true,
        item:{}
      };
    }
    async componentDidMount() {
      indexEvents.clearCache()
      console.log('on charge levemt!!')
      console.log(this.props.item.eventID)
      var event = await indexEvents.getObject(this.props.item.eventID)
      console.log('event!!!!!!@wqadjksfslf')
      console.log(event)
      this.setState({loader:false,item:event})
    }
    async clickProduct () {
      console.log('this.props.category')
      console.log(this.props.item)
      this.props.clickEvent(this.state.item)
    }
    entreeFee(entreeFee) {
      if (entreeFee == 0) return 'Free'
      return '$' + entreeFee 
    }
    coach() {
      return this.props.item.coach
    }
    alertCoach() {
      var alert = ''
      if (this.props.groupPage) return true
      if (this.coach() && this.state.item.info.organizer == this.props.userID) {
        alert = 'You created this event as a coach'
      }
      else if (this.coach()){
        alert = 'You attended this event as a coach'
      } else if (!this.coach() && this.state.item.info.organizer == this.props.userID) {
        alert = 'You created this event as a player'
      }
      else if (!this.coach()){
        alert = 'You attended this event as a player'
      }
      this.props.navigate('Alert',{title:alert,close:true,textButton:'Got it!',onGoBack:() => this.closeAlert(),icon:this.iconCoach()})
    }
    closeAlert() {
      console.log('close alert!')
      this.props.navigate('ListEvents',{})
    }
    sizeCol () {
      if (this.state.item.info.organizer != this.props.userID) return 60
      return 70
    }
    onPress(val) {
      if (val) return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation,timing(300,100)),
      ]).start()
      return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation,timing(0,100)),
      ]).start()
    }
    card (color) {
      if (this.state.loader)return <PlacelHolder groupPage={this.props.groupPage}/>
      return <FadeInView duration={250}>{this.displayCard(color)}</FadeInView>
    }
    iconCoach() {
      if (this.coach()) {
        return <View style={[styleApp.roundView,{backgroundColor:colors.green}]}>
                  <Text style={[styleApp.text,{color:'white',fontSize:10}]}>C</Text>
                </View>
      }
      return <View style={[styleApp.roundView,{backgroundColor:colors.secondary}]}>
      <Text style={[styleApp.text,{color:'white',fontSize:10}]}>P</Text>
    </View>
    }
    displayCard(color) {
      var sport = Object.values(this.props.sports).filter(sport => sport.value == this.state.item.info.sport)[0]
      return (
        <Animated.View style={[styles.cardList,{backgroundColor:color},]}>
        
        <TouchableOpacity 
          onPress={() => {this.clickProduct()}} 
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          style={{height:'100%',width:'100%',paddingTop:15,paddingLeft:20,paddingRight:20}} 
          activeOpacity={1} 
        >
          
          <Row>
            <Col size={60} style={styleApp.center2} >
            <Text style={[styles.subtitle,{color:colors.primary,fontFamily:'OpenSans-SemiBold',fontSize:12}]}>{date(this.state.item.date.start,'ddd, Do MMM')} at {date(this.state.item.date.start,'h:mm a')}</Text>
              
            </Col>
            {/* <Col size={10} style={styleApp.center3} activeOpacity={0.7} onPress={() => this.alertCoach()}>
              {this.props.groupPage!= true?this.iconCoach():null}
            </Col> */}
            <Col size={10} style={styleApp.center3} >
              {
              this.props.groupPage?
              null
              :this.props.item.organizer?
              <AllIcons name='bullhorn' type='font' color={colors.blue} size={15} />
              :!this.props.item.organizer && (this.props.item.status == 'confirmed' || !this.state.item.info.public)?
              <AllIcons name='check' type='mat' color={colors.green} size={20} />
              :!this.props.item.organizer && this.props.item.status == 'rejected'?
              <AllIcons name='close' type='mat' color={colors.primary} size={20} />
              :!this.props.item.organizer?
              <AllIcons name='clock' type='font' color={colors.secondary} size={16} />
              :null
              }
            </Col>
            <Col size={20} style={styleApp.center3} >
              <View style={[styles.viewSport,{backgroundColor:sport.card.color.backgroundColor}]}>
                <Text style={[styles.textSport,{color:sport.card.color.color}]}>{this.state.item.info.sport.charAt(0).toUpperCase() + this.state.item.info.sport.slice(1)}</Text>
              </View>
            </Col>
          </Row>
          <Row style={{marginTop:0}}>
            <Col size ={80} style={styleApp.center2}>
            <Text style={[styles.title,{fontFamily:'OpenSans-SemiBold',fontSize:18}]}>{this.state.item.info.name}</Text>
            </Col>
            <Col size ={20} style={styleApp.center3}>
            <Text style={[styles.textPrice,{marginTop:20}]}>{this.entreeFee(this.state.item.price.joiningFee)}</Text>
            </Col>
          </Row>
          
          <Row style={{marginTop:0,marginBottom:15}}>
            <Col style={[styles.center2,{paddingTop:0,paddingBottom:10}]} size={80}>
              <Text style={styles.subtitle}>{this.state.item.location.area}</Text>

            </Col>
            <Col style={styleApp.center3} size={20}>
              
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
    //width: '48%',
    width:'100%',
    //marginLeft:-20,
    // aspectRatio: 1,
    backgroundColor:'white',  
    //borderTopWidth:0.3,
    //borderRightWidth:0.3,
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
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    //top:15,
    //right:0,
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
    fontSize:18,
    fontFamily: 'OpenSans-Bold',
  },
  title:{
    color:colors.title,
    fontSize:17,
    fontFamily: 'OpenSans-Bold',
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



