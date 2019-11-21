
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
      if (this.props.loadData) {
        indexEvents.clearCache()
        var group = await indexEvents.getObject(this.props.item.eventID)
        console.log('event!!!!!!@wqadjksfslf')
        console.log(group)
        return this.setState({loader:false,item:group})
      }
      return this.setState({loader:false})
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
    click(data) {
      this.props.openEvent(data)
    }
    card (color,data) {
      if (this.state.loader)return <View style={styles.cardList}><PlacelHolder /></View>
      return this.displayCard(color,data)
    }
    numberMember(data) {
      if (data.attendees != undefined) return Object.values(data.attendees).length
      return 0
    }
    rowAttendees(data) {
      return <Row style={{marginTop:15}}>
      <Col size={15} style={[{paddingRight:10},styleApp.center2]}>
        <View style={[styleApp.viewNumber,styleApp.center,{backgroundColor:colors.primaryLight,}]}>
          <Text style={[styleApp.text,{fontSize:10,color:'white',fontFamily:'OpenSans-Bold'}]} >{this.numberMember(data)}</Text>
        </View>
      </Col>
        {
        data.attendees != undefined?
        <Col size={85} style={[{paddingRight:10},styleApp.center2]}>
          {
          Object.values(data.attendees).slice(0,3).map((member,i) => (
          <View style={[styleApp.viewNumber,styleApp.center,{position:'absolute',left:i*14}]}>
            <Text style={[styleApp.text,{fontSize:10,fontFamily:'OpenSans-Bold'}]} >{member.captainInfo.name.split(' ')[0][0] + member.captainInfo.name.split(' ')[1][0]}</Text>
          </View>
          ))
        }
        </Col>
        :null
        }
    </Row> 
    }
    displayCard(color,data) {
      console.log('display card')
      console.log(this.props.item)
      var sport = Object.values(this.props.sports).filter(sport => sport.value == data.info.sport)[0]
      if (sport == undefined) return null
      return (
        <Animated.View style={[styles.cardList,{backgroundColor:color}]}>
        
        <TouchableOpacity 
          onPress={() => this.click(data)} 
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          style={{height:'100%',width:'100%',paddingLeft:10,paddingRight:10,paddingTop:15,paddingBottom:20}} 
          activeOpacity={1} 
        >

          <Row>
            <Col size={80} style={[styleApp.center2,{paddingLeft:0}]}>
              <Text style={[styles.subtitle,{color:colors.primary,fontFamily: 'OpenSans-SemiBold',fontSize:11}]}>{date(data.date.start,'ddd, Do MMM')} at {time(data.date.start,'h:mm a')}</Text>
              
            </Col>
            <Col size={20} style={styleApp.center3}>
              {/* <View style={[styles.viewSport,{backgroundColor:sport.card.color.color,width:30,height:30,borderRadius:15}]}>
                <Text style={[styles.textSport,{color:'white'}]}>{data.info.sport.charAt(0).toUpperCase()}</Text>
              </View> */}
            </Col>

          </Row>
          <Text style={[styles.title,{fontSize:14}]}>{data.info.name}</Text>
          {
          data.info.public?
          <Text style={[styles.subtitle,{marginTop:5}]}>{data.location.area}</Text>
          :null
          }
          {/* <Text style={[styles.subtitle,{marginTop:5}]}>{this.entreeFee(data.price.joiningFee)}</Text> */}

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
      this.card(color,this.props.loadData?this.state.item:this.props.data)
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
    height:170,
    marginRight:10,
    borderRadius:10,
    borderWidth:0.3,
    borderColor:colors.borderColor,
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
  };
};

export default connect(mapStateToProps,{})(CardEvent);



