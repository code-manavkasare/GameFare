import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Image,
    TextInput,
    ScrollView
} from 'react-native';
import firebase from 'react-native-firebase'
import {connect} from 'react-redux';

const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import FadeInView from 'react-native-fade-in-view';
import Switch from '../../layout/switch/Switch'

import CardEvent from './CardEventSM'
import {timing,native} from '../../animations/animations'
import {indexGroups,indexEvents,indexPastEvents} from '../../database/algolia'

import ScrollViewX from '../../layout/scrollViews/ScrollViewX'

class ListEvents extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      futureEvents:[],
      pastEvents:[],
      loader1:true,
      loader2:false,
      past:false,
    }
    this.componentDidMount = this.componentDidMount.bind(this)
    this.translateXView1 = new Animated.Value(0)
    this.translateXView2 = new Animated.Value(width)
  }
  
  async componentDidMount() {
    this.props.onRef(this)
    return this.loadEvent(this.state.past,this.props.sportSelected,this.props.leagueSelected)
  }
  async reload() {
    return this.loadEvent(this.state.past,this.props.sportSelected,this.props.leagueSelected)
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.userConnected != nextProps.userConnected && nextProps.userConnected == true || this.props.sportSelected != nextProps.sportSelected || this.props.leagueSelected != nextProps.leagueSelected) {
      this.loadEvent(this.state.past,nextProps.sportSelected,nextProps.leagueSelected)
    }
  }
  async loadEvent(past,sport,league,) {
    console.log('on reload')
    if (!past) {
      await this.setState({loader1:true})
      indexEvents.clearCache()
      var filterSport = 'info.sport:' + sport 
      var filterLeague = ' AND info.league:' + league
      if (league == 'all') {
        filterLeague = ''
      }
      var filterAttendees = ' AND allAttendees:' + this.props.userID 
      var futureEvents = await indexEvents.search({
        query:'',
        filters:filterSport + filterAttendees + filterLeague ,
      })
      futureEvents = futureEvents.hits
      console.log('futureEvents')
      console.log(futureEvents)
      this.setState({loader1:false,futureEvents:futureEvents})
    } else {
      await this.setState({loader2:true})
      indexPastEvents.clearCache()
      //'info.sport:' + 
      //'AND allMembers:' + this.props.userID 
      var pastEvents = await indexPastEvents.search({
        query:'',
        filters:'info.sport:' + this.props.sportSelected  ,
      })
      pastEvents = pastEvents.hits
      console.log('futureEvents')
      console.log(pastEvents)
      this.setState({loader2:false,pastEvents:pastEvents})
    }
    
  }
  openEvent(event) {
    // if (!event.info.public) {
    //   return this.props.navigate('Alert',{close:true,title:'The event is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'Home',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    // }
    return this.props.navigate('Event',{data:event,pageFrom:'Home'})
  }
  async setSwitch(state,val) {
    await this.setState({[state]:val})
    await this.translateViews(val)
    return true
  }
  switch (textOn,textOff,state,translateXComponent0,translateXComponent1) {
    return (
      <Switch 
        textOn={textOn}
        textOff={textOff}
        translateXTo={width/2-20}
        height={50}
        translateXComponent0={translateXComponent0}
        translateXComponent1={translateXComponent1}
        state={this.state[state]}
        setState={(val) => this.setSwitch(state,val)}
      />
    )
  }
  translateViews(val) {
    if (val) {
      return Animated.parallel([
        Animated.spring(this.translateXView1,native(-width)),
        Animated.spring(this.translateXView2,native(0)),
      ]).start()
    }
    return Animated.parallel([
      Animated.spring(this.translateXView1,native(0)),
      Animated.spring(this.translateXView2,native(width)),
    ]).start()
  }
  listEvents(events) {
    console.log('display future events')
    console.log(events)
    return Object.values(events).map((event,i) => (
      <CardEvent userCard={false} key={i} loadData={false} homePage={true} openEvent={(event) => this.openEvent(event)} item={event} data={event}/>
    ))
  }
  ListEvent () {
    if (!this.props.userConnected) return null
    var numberPast = ''
    var numberFuture = ''
    if (!this.state.loader1) {
      numberPast = ' ('+this.state.pastEvents.length + ')'
      numberFuture = ' ('+this.state.futureEvents.length + ')'
    }
    return (
      <View style={{marginTop:20}}>
        <View style={[styleApp.marginView,{marginBottom:25}]}>

        <Text style={[styleApp.input,{marginBottom:15,marginLeft:0,fontSize:22}]}>My events</Text>
        {this.switch('Upcoming' + numberFuture,'Past' + numberPast)}
        </View>

        <View style={{flex:1,marginTop:-5}}>
        <Animated.View style={{flex:1,backgroundColor:'white',borderRightWidth:0,borderColor:colors.grey,transform:[{translateX:this.translateXView1}]}}>
        <ScrollViewX 
        loader={this.state.loader1}
        events={this.state.futureEvents}
        height={180}
        messageNoEvent = {"You haven't subscribe to any event."}
        content={() => this.listEvents(this.state.futureEvents)}
        openEvent={(event) => this.openEvent(event)}
        onRef={ref => (this.scrollViewRef1 = ref)}
        />
        </Animated.View>

        <Animated.View style={{flex:1,backgroundColor:'white',position:'absolute',top:0,transform:[{translateX:this.translateXView2}]}}>
        <ScrollViewX 
        height={180}
        loader={this.state.loader2}
        events={this.state.pastEvents}
        messageNoEvent = {"You don't have any past events."}
        content={() => this.listEvents(this.state.pastEvents)}
        openEvent={(event) => this.openEvent(event)}
        onRef={ref => (this.scrollViewRef2 = ref)}
        />
        </Animated.View>
        </View>
       
        
      </View>
    )
  }
  render() {
    return this.ListEvent()
  }
}

const styles = StyleSheet.create({
  text:{
    fontFamily:'OpenSans-SemiBold',
    color:colors.title
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

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    userConnected:state.user.userConnected,
    sportSelected:state.historicSearch.sport,
    leagueSelected:state.historicSearch.league,
  };
};

export default connect(mapStateToProps,{})(ListEvents);
