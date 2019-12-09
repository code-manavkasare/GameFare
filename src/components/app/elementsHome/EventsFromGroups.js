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
import {eventsAction} from '../../../actions/eventsActions'

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

class MyEvents extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      futureEvents:[],
      pastEvents:[],
      loader:true,
      loader2:false,
      past:false,
    }
    this.componentDidMount = this.componentDidMount.bind(this)
    this.translateXView1 = new Animated.Value(0)
    this.translateXView2 = new Animated.Value(width)
  }
  
  async componentDidMount() {
    this.props.onRef(this)
    console.log('le time stamt !!!')
    console.log(Number(new Date()))
    console.log(this.props.futureEvents)
    return this.loadEvent(this.state.past,this.props.sportSelected,this.props.leagueSelected)
  }
  async reload() {
    return this.loadEvent(this.state.past,this.props.sportSelected,this.props.leagueSelected)
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.userConnected != nextProps.userConnected && nextProps.userConnected == true) {
      this.loadEvent(this.state.past,nextProps.sportSelected,nextProps.leagueSelected)
    }
  }
  async getEvents (filters) {
      var futureEvents = await indexEvents.search({
        query:'',
        filters:filters,
      })
      return futureEvents.hits
  }
  async loadEvent(past,sport,league,) {
    console.log('on reload')
    await this.setState({loader:true})

    indexEvents.clearCache()

    var filterAttendees = 'allAttendees:' + this.props.userID + ' OR allCoaches:' + this.props.userID + ' OR info.organizer:' + this.props.userID 
    var filters = filterAttendees

    var filterDate =' AND date_timestamp>' + Number(new Date())
    var futureEvents = await this.getEvents (filters + filterDate) 
    var allEvents = futureEvents.reduce(function(result, item) {
      result[item.objectID] = item;
      return result;
    }, {});
    futureEvents = futureEvents.map(x => x.objectID);

    filterDate =' AND date_timestamp<' + Number(new Date())
    var pastEvents = await this.getEvents (filters + filterDate) 
    var allEventsPast = pastEvents.reduce(function(result, item) {
      result[item.objectID] = item;
      return result;
    }, {});
    pastEvents = pastEvents.map(x => x.objectID);

    allEvents = {
      ...allEvents,
      ...allEventsPast
    }

    console.log('pastEvents')
    console.log(pastEvents)
    console.log(futureEvents)
    console.log(allEvents)
    await  this.props.eventsAction('setAllEvents',allEvents)
    await  this.props.eventsAction('setFutureUserEvents',futureEvents)
    await  this.props.eventsAction('setPastUserEvents',pastEvents)
    

    this.setState({loader:false})
  }
  openEvent(objectID) {
    // if (!event.info.public) {
    //   return this.props.navigate('Alert',{close:true,title:'The event is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'Home',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    // }
    console.log('openEvent')
    console.log(objectID)
    return this.props.navigate('Event',{objectID:objectID,pageFrom:'Home'})
  }
  async setSwitch(state,val) {
    await this.setState({[state]:val})
    return true
  }
  switch (textOn,textOff,state,translateXComponent0,translateXComponent1) {
    return (
      <Switch 
        textOn={textOn}
        textOff={textOff}
        translateXTo={width/2-20}
        height={50}
        translateXComponent0={this.translateXView1}
        translateXComponent1={this.translateXView2}
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
    return events.map((event,i) => (
      <CardEvent size={'SM'} userCard={false} key={i} index={i} league={this.props.leagueSelected}  loadData={false} homePage={true} openEvent={(objectID) => this.openEvent(objectID)} item={event} data={event}/>
    ))
  }
  leagueFilter(league) {
    if (this.props.leagueSelected == 'all') return true
    return league == this.props.leagueSelected
  }
  ListEvent () {
    if (!this.props.userConnected) return null

    

    const AllFutureEvents = this.props.futureEvents.map(event => this.props.allEvents[event])
    const AllPastEvents = this.props.pastEvents.map(event => this.props.allEvents[event])

    var futureEvents = AllFutureEvents.filter(event => event.info.sport == this.props.sportSelected && this.leagueFilter(event.info.league))
    var pastEvents = AllPastEvents.filter(event => event.info.sport == this.props.sportSelected && this.leagueFilter(event.info.league))

    var numberFuture = ''
    var numberPast = ''
    if (!this.state.loader) {
      numberFuture = ' (' + futureEvents.length + ')'
      numberPast = ' (' + pastEvents.length + ')'
    }
    return (
      <View style={{marginTop:20}}>
        <View style={[styleApp.marginView,{marginBottom:15}]}>

        <Text style={[styleApp.input,{marginBottom:15,marginLeft:0,fontSize:22}]}>My events</Text>
        {this.switch('Upcoming' + numberFuture,'Past'+numberPast)}
        </View>

        <View style={{flex:1,marginTop:-5}}>
        <Animated.View style={{height:225,paddingTop:15,borderRightWidth:0,borderColor:colors.grey,transform:[{translateX:this.translateXView1}]}}>
        <ScrollViewX 
        loader={this.state.loader}
        events={futureEvents}
        height={180}
        messageNoEvent = {"You haven't subscribe to any event."}
        content={(events) => this.listEvents(events)}
        openEvent={(objectID) => this.openEvent(objectID)}
        onRef={ref => (this.scrollViewRef1 = ref)}
        />
        </Animated.View>

        <Animated.View style={{height:200,backgroundColor:'white',position:'absolute',top:0,transform:[{translateX:this.translateXView2}]}}>
        <ScrollViewX 
        height={180}
        loader={this.state.loader}
        events={pastEvents}
        messageNoEvent = {"You don't have any past events."}
        content={(events) => this.listEvents(events)}
        openEvent={(objectID) => this.openEvent(objectID)}
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

    sports:state.globaleVariables.sports.list,
    sportSelected:state.historicSearch.sport,
    leagueSelected:state.historicSearch.league,

    futureEvents:state.events.futureUserEvents,
    pastEvents:state.events.pastUserEvents,
    allEvents:state.events.allEvents
  };
};

export default connect(mapStateToProps,{eventsAction})(MyEvents);
