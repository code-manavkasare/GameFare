
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
import FadeInView from 'react-native-fade-in-view';

import { Col, Row, Grid } from "react-native-easy-grid";
import colors from '../../style/colors'
import Icon from '../../layout/icons/icons'
import AllIcons from '../../layout/icons/AllIcons'
import AsyncImage from '../../layout/image/AsyncImage'

import PlacelHolder from '../../placeHolders/CardEvent.js'
import ButtonColor from '../../layout/Views/Button'
import styleApp from '../../style/style'
import {indexEvents} from '../../database/algolia'
import {timing,native} from '../../animations/animations'

var  { height, width } = Dimensions.get('screen')
import {date,time,timeZone} from '../../layout/date/date'

class CardEvent extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        player:false,
        loader:false
      };
    }
    async componentDidMount() {
      // if (this.props.loadData) {
      //   indexEvents.clearCache()
      //   var group = await indexEvents.getObject(this.props.item.eventID)
      //   return this.setState({loader:false,item:group})
      // }
      // return this.setState({loader:false})
    }
    entreeFee(entreeFee) {
      if (entreeFee == 0) return 'Free entry'
      return '$' + entreeFee + ' entry fee'
    }
    card (color,data) {
      if (this.state.loader)return <View style={styleApp.cardEventSM}><PlacelHolder /></View>
      return this.displayCard(color,data)
    }
    numberMember(data) {
      if (data.attendees != undefined) return Object.values(data.attendees).length
      return 0
    }
    rowAttendees(data) {
      console.log('data evnet')
      console.log(data)
      return <Row style={{marginTop:15}}>
      <Col size={15} style={[{paddingRight:10},styleApp.center2]}>
        <View style={[styleApp.viewNumber,styleApp.center,{backgroundColor:colors.primary2,}]}>
          <Text style={[styleApp.text,{fontSize:10,color:'white',fontFamily:'OpenSans-Bold'}]} >{this.numberMember(data)}</Text>
        </View>
      </Col>
        {
        data.attendees != undefined?
        <Col size={30} style={[{paddingRight:10},styleApp.center2]}>
          {
          Object.values(data.attendees).slice(0,3).map((member,i) => (
          <View key={i} style={[styleApp.viewNumber,styleApp.center,{position:'absolute',left:i*14}]}>
            <Text style={[styleApp.text,{fontSize:10,fontFamily:'OpenSans-Bold'}]} >{member.info.firstname[0] + member.info.lastname[0]}</Text>
          </View>
          ))
        }
        </Col>
        :null
        }
        <Col size={55} style={styleApp.center2}>
        <Text style={[styleApp.text,{fontSize:11}]}>Person coming</Text>
        </Col>
    </Row> 
    }
    displayCard(data) {
      var sport = Object.values(this.props.sports).filter(sport => sport.value == data.info.sport)[0]
      var league = Object.values(sport.typeEvent).filter(item => item.value == data.info.league)[0]
      console.log('display card')
      console.log(league)
      console.log(sport)
      return (
        <ButtonColor key={this.props.index} view={() => {
          return (
            <FadeInView duration={300} style={{width:'100%',height:'100%',}}>
              {
                this.props.league == 'all'?
                <AsyncImage style={{width:28,height:28,borderRadius:14,position:'absolute',right:0,top:0}} mainImage={league.icon} imgInitial={league.icon} />
                :null
              }
              
              <Text style={[styleApp.input,{color:colors.primary2,fontSize:12}]}>{date(data.date.start,'ddd, Do MMM')} <Text style={{color:colors.title,fontSize:10}}>•</Text> {time(data.date.start,'h:mm a')}</Text>
              <Text style={[styleApp.input,{fontSize:15,minHeight:20,marginTop:5}]}>{data.info.name}</Text>
              <Text style={[styles.subtitle,{marginTop:5,minHeight:35}]}>{data.location.address}</Text>
          
    
              {this.rowAttendees(data)}
              {
                this.props.size=='M'?
                <View style={{height:0.5,borderTopWidth:0.5,borderColor:colors.grey,marginTop:15}} />
                :null
              }
            </FadeInView>
          )
        }} 
        click={() => this.props.openEvent(data.objectID)}
        color={'white'}
        style={this.props.size=='SM'?styleApp.cardEventSM:styleApp.cardEvent}
        onPressColor={colors.off}
        />
      )
    }

  render() {
    return (
      this.card(this.props.data)
    );
  }
}

const styles = StyleSheet.create({
  cardList:{
    backgroundColor:'white',
    shadowColor: '#46474B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 60,
    shadowOpacity: 1,
    marginRight:0,
    overflow:'hidden',
    height:180,
    marginRight:10,
    borderRadius:3,
    borderWidth:1,
    borderColor:colors.grey,
    width:220
  
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
    league:state.historicSearch.league
  };
};

export default connect(mapStateToProps,{})(CardEvent);



