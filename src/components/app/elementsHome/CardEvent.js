
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
import MapboxGL from '@react-native-mapbox-gl/maps';
MapboxGL.setAccessToken('pk.eyJ1IjoiYmlyb2xsZWF1ZiIsImEiOiJjampuMHByenoxNmRoM2ttcHVqNmd0bzFvIn0.Fml-ls_j4kW_OJViww4D_w');
import AsyncStorage from '@react-native-community/async-storage';

import { Col, Row, Grid } from "react-native-easy-grid";
import colors from '../../style/colors'
import Icon from '../../layout/icons/icons'
import AllIcons from '../../layout/icons/AllIcons'
import PlacelHolder from '../../placeHolders/CardEvent.js'
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
        backgroundColorAnimation:new Animated.Value(0),
        loader:true
      };
      this.scaleCard = new Animated.Value(1);
    }
    async componentDidMount() {
      // if (this.props.loadData) {
      //   indexEvents.clearCache()
      //   var group = await indexEvents.getObject(this.props.data.objectID)
      //  this.setState({loader:false,item:group})
      // }
      this.setState({loader:false})
      return this.loadMapImage(this.props.data)
    }
    entreeFee(entreeFee) {
      if (entreeFee == 0) return 'Free entry'
      return '$' + entreeFee + ' entry fee'
    }
    async loadMapImage (data) {
      console.log('loulouloulou')
      console.log(data)
      var uri = await AsyncStorage.getItem(data.objectID)
      if(uri == null) {
        uri = await MapboxGL.snapshotManager.takeSnap({
          centerCoordinate: [data.location.lng, data.location.lat],
          width: width-20,
          height: 300,
          zoomLevel: 12,
          pitch: 30,
          heading: 20,
          // styleURL: MapboxGL.StyleURL.Dark,
          writeToDisk: true, // Create a temporary file
        });
        return AsyncStorage.setItem(data.objectID, uri)
      }
      return true
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
    click(data) {
      this.props.openEvent(data)
    }
    card (color,data) {
      if (this.state.loader)return <PlacelHolder />
      return this.displayCard(color,data)
    }
    numberMember(data) {
      if (data.attendees != undefined) return Object.values(data.attendees).length
      return 0
    }
    rowAttendees(data) {
      return <Row style={{marginTop:15}}>
      <Col size={7} style={[{paddingRight:10},styleApp.center2]}>
        <View style={[styleApp.viewNumber,styleApp.center,{backgroundColor:colors.primaryLight,}]}>
          <Text style={[styleApp.text,{fontSize:10,color:'white',fontFamily:'OpenSans-Bold'}]} >{this.numberMember(data)}</Text>
        </View>
      </Col>
        {
        data.attendees != undefined?
        <Col size={15} style={[{paddingRight:10},styleApp.center2]}>
          {
          Object.values(data.attendees).slice(0,3).map((member,i) => (
          <View key={i} style={[styleApp.viewNumber,styleApp.center,{position:'absolute',left:i*14}]}>
            <Text style={[styleApp.text,{fontSize:10,fontFamily:'OpenSans-Bold'}]} >{member.captainInfo.name.split(' ')[0][0] + member.captainInfo.name.split(' ')[1][0]}</Text>
          </View>
          ))
        }
        </Col>
        :null
        }

      <Col size={70} style={styleApp.center2}>
        <Text style={[styleApp.smallText,{fontFamily:'OpenSans-SemiBold',fontSize:11}]}>Person coming</Text>
      </Col>
    </Row> 
    }
    displayCard(color,data) {
      var sport = Object.values(this.props.sports).filter(sport => sport.value == data.info.sport)[0]
      if (sport == undefined) return null
      // this.loadMapImage(data)
      return (
        <Animated.View style={[styles.cardList,{backgroundColor:color}]}>
        
        <TouchableOpacity 
          onPress={() => this.click(data)} 
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          style={{height:'100%',width:'100%',paddingLeft:20,paddingRight:20,paddingTop:15,paddingBottom:20}} 
          activeOpacity={1} 
        >

          <Row>
            <Col size={70} style={[styleApp.center2,{paddingLeft:0}]}>
              <Text style={[styles.subtitle,{color:colors.primary,fontFamily: 'OpenSans-SemiBold',}]}>{date(data.date.start,'ddd, Do MMM')} <Text style={{color:colors.title,fontSize:13}}>•</Text> {time(data.date.start,'h:mm a')}</Text>
              
            </Col>
            <Col size={10} style={styleApp.center2} >
              {
              !this.props.userCard && !data.info.public?
              <AllIcons name='lock' color={colors.blue} size={17} type='mat' />
              :this.props.userCard && this.props.item.organizer?
              <AllIcons name='bullhorn' type='font' color={colors.blue} size={15} />
              :this.props.userCard && !this.props.item.organizer && (this.props.item.status == 'confirmed' || !this.state.item.info.public)?
              <AllIcons name='check' type='mat' color={colors.green} size={20} />
              :this.props.userCard && !this.props.item.organizer && this.props.item.status == 'rejected'?
              <AllIcons name='close' type='mat' color={colors.primary} size={20} />
              :this.props.userCard && !this.props.item.organizer?
              <AllIcons name='clock' type='font' color={colors.secondary} size={16} />
              :null
              }
            </Col>
            <Col size={20} style={styleApp.center8}>
              {/* <View style={[styles.viewSport,{backgroundColor:sport.card.color.color}]}>
                <Text style={[styles.textSport,{color:'white'}]}>{data.info.sport.charAt(0).toUpperCase() + data.info.sport.slice(1)}</Text>
              </View> */}
            </Col>

          </Row>
          <Text style={styles.title}>{data.info.name}</Text>
          {
          data.info.public?
          <Text style={[styles.subtitle,{marginTop:5}]}>{data.location.address}</Text>
          :null
          }
          <Text style={[styles.subtitle,{marginTop:5}]}>{this.entreeFee(data.price.joiningFee)}</Text>

          {this.rowAttendees(data)}

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
      this.card(color,this.props.data)
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



