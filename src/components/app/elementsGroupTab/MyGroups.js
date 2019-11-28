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
import {groupsAction} from '../../../actions/groupsActions'

const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import FadeInView from 'react-native-fade-in-view';
import Switch from '../../layout/switch/Switch'

import CardGroup from './CardGroup'
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
    console.log('le time stamt !!!')
    console.log(Number(new Date()))
    console.log(this.props.mygroups)
    return this.loadEvent(this.props.sportSelected,this.props.leagueSelected)
  }
  async reload() {
    return this.loadEvent(this.props.sportSelected,this.props.leagueSelected)
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.userConnected != nextProps.userConnected && nextProps.userConnected == true || this.props.sportSelected != nextProps.sportSelected || this.props.leagueSelected != nextProps.leagueSelected) {
      this.loadEvent(nextProps.sportSelected,nextProps.leagueSelected)
    }
  }
  async getGroups (filters) {
      var mygroups = await indexGroups.search({
        query:'',
        filters:filters,
      })
      return mygroups.hits
  }
  async loadEvent(sport,league,) {
    console.log('on reload')
    await this.setState({loader1:true})

    indexGroups.clearCache()
    var filterSport = ' AND info.sport:' + sport 
    // var filterLeague = ' AND info.league:' + league
    if (league == 'all') {
      filterLeague = ''
    }
    console.log(this.props.userID)
    console.log(sport)
    var filterOrganizer='info.organizer:' + this.props.userID 
    var filters = filterOrganizer + filterSport

    // var filterDate =' AND date_timestamp>' + Number(new Date())
    //var mygroups = await this.getGroups (filters) 
    console.log('myGroups')
   //console.log(mygroups)
    // filterDate =' AND date_timestamp<' + Number(new Date())
    // var pastEvents = await this.getEvents (filters + filterDate) 

    //await  this.props.groupsAction('setMygroups',mygroups)

    this.setState({loader1:false})
   
  }
  openGroup(group) {
    console.log('click group')
    console.log(group)
    return this.props.navigate('Group',{data:group,pageFrom:'ListGroups'})
  }
  async setSwitch(state,val) {
    // await this.setState({[state]:val})
    // await this.translateViews(val)
    return false
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
    console.log('display future events')
    console.log(events)
    return Object.values(events).map((event,i) => (
      <CardGroup userCard={false} key={i} loadData={false} homePage={true} openGroup={(group) => this.openGroup(group)} item={event} data={event}/>
    ))
  }
  ListEvent () {
    console.log('My groups')
    console.log(this.props.mygroups)
    if (!this.props.userConnected) return null
    var numberPast = ''
    var numberFuture = ''
    if (!this.state.loader1) {
      // numberPast = ' ('+this.props.mygroups.length + ')'
      // numberFuture = ' ('+this.props.mygroups.length + ')'
    }

    return (
      <View style={{marginTop:0}}>
        <View style={[styleApp.marginView,{marginBottom:25}]}>

        <Text style={[styleApp.input,{marginBottom:25,marginLeft:0,fontSize:22}]}>My groups</Text>
        {this.switch('All' + numberFuture,'Past' + numberPast)}
        </View>

        <View style={{flex:1,marginTop:0}}>
        <Animated.View style={{height:200,backgroundColor:'white',borderRightWidth:0,borderColor:colors.grey,transform:[{translateX:this.translateXView1}]}}>
        <ScrollViewX 
        loader={this.state.loader1}
        events={this.props.mygroups}
        height={180}
        placeHolder={styleApp.cardGroup}
        messageNoEvent = {"You haven't joined any group yet."}
        content={() => this.listEvents(this.props.mygroups)}
        // openEvent={(group) => this.openGroup(group)}
        onRef={ref => (this.scrollViewRef1 = ref)}
        />
        </Animated.View>

        <Animated.View style={{height:200,backgroundColor:'white',position:'absolute',top:0,transform:[{translateX:this.translateXView2}]}}>
        {/* <ScrollViewX 
        height={180}
        loader={this.state.loader1}
        events={this.props.pastEvents}
        messageNoEvent = {"You don't have any past events."}
        content={() => this.listEvents(this.props.pastEvents)}
        openEvent={(event) => this.openEvent(event)}
        onRef={ref => (this.scrollViewRef2 = ref)}
        /> */}
        </Animated.View>
        </View>
       
        
      </View>
    )
  }
  render() {
    return this.ListEvent()
  }
}

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    userConnected:state.user.userConnected,
    sportSelected:state.historicSearch.sport,
    leagueSelected:state.historicSearch.league,
    mygroups:state.groups.mygroups
  };
};

export default connect(mapStateToProps,{groupsAction})(ListEvents);
