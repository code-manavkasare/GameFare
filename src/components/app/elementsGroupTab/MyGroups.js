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
import isEqual from 'lodash.isequal'

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
    var mygroups = await this.getGroups (filters) 
    var infoGroups = mygroups.reduce(function(result, item) {
      result[item.objectID] = item;
      return result;
    }, {});
    mygroups = mygroups.map(x => x.objectID);
    console.log('myGroups hihaaaaa')
   console.log(infoGroups)
   console.log(mygroups)
    // filterDate =' AND date_timestamp<' + Number(new Date())
    // var pastEvents = await this.getEvents (filters + filterDate) 

    if (!isEqual(this.props.mygroups,mygroups)) {
      await  this.props.groupsAction('setAllGroups',infoGroups)
      await  this.props.groupsAction('setMygroups',mygroups)
    }
    this.setState({loader1:false})
   
  }
  openGroup(objectID) {
    console.log('click group')
    console.log(objectID)
    return this.props.navigate('Group',{objectID:objectID,pageFrom:'ListGroups'})
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
    return Object.values(events).map((event,i) => (
      <CardGroup userCard={false} pageFrom={'ListGroups'} key={i} loadData={false} homePage={true} openGroup={(objectID) => this.openGroup(objectID)} item={this.props.allGroups[event]} data={this.props.allGroups[event]}/>
    ))
  }
  ListEvent () {
    console.log('My groups')
    console.log(this.props.mygroups)
    if (!this.props.userConnected) return null
    var numberFuture = ''
    if (!this.state.loader1) {
      numberFuture = ' ('+this.props.mygroups.length + ')'
    }

    return (
      <View style={{marginTop:10}}>
        <View style={[styleApp.marginView,{marginBottom:10}]}>

        <Text style={[styleApp.input,{marginBottom:10,marginLeft:0,fontSize:22}]}>My groups {numberFuture}</Text>
        {/* {this.switch('All' + numberFuture,'Past' + numberPast)} */}
        </View>


        <Animated.View style={{height:250,borderRightWidth:0,backgroundColor:'red',borderColor:colors.grey,transform:[{translateX:this.translateXView1}]}}>
        <ScrollViewX 
        loader={this.state.loader1}
        events={this.props.mygroups}
        // height={260}
        placeHolder={[styleApp.cardGroup,styleApp.shade,{paddingLeft:10,paddingRight:10,paddingTop:10}]}
        imageNoEvent = 'group'
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



       <View style={styleApp.marginView}>
        <View style={[styleApp.divider2,{marginTop:30}]} />
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
    mygroups:state.groups.mygroups,
    allGroups:state.groups.allGroups
  };
};

export default connect(mapStateToProps,{groupsAction})(ListEvents);
