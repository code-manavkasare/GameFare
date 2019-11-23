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

import PlaceHolder from '../../placeHolders/CardEvent'
import CardEvent from './CardEventSM'
import {timing,native} from '../../animations/animations'
import Button from '../../layout/Views/Button'
import {indexGroups,indexEvents} from '../../database/algolia'

import ScrollViewX from '../../layout/scrollViews/ScrollViewX'


import AllIcons from '../../layout/icons/AllIcons'
import NavigationService from '../../../../NavigationService';

class ListEvents extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      events:[],
      eventsPast:[],
      loader:true,
      past:false,
    }
    this.componentDidMount = this.componentDidMount.bind(this)
    this.translateXView1 = new Animated.Value(0)
    this.translateXView2 = new Animated.Value(width)
  }
  
  async componentDidMount() {
    this.props.onRef(this)
    await this.setState({loader:true})
    return this.loadEvent()
  }
  async reload() {
    await this.setState({loader:true})
    return this.loadEvent()
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.userConnected != nextProps.userConnected && nextProps.userConnected == true) {
      await this.setState({loader:true})
      this.loadEvent()
    }
  }
  async loadEvent(search) {
    console.log('on reload')
    var allEvents = {}
    var groups = await firebase.database().ref('usersGroups/' + this.props.userID).once('value')
    groups = groups.val()
    if (groups == null) return this.setState({loader:false})
    for (var i in groups) {
      var group = groups[i]
      var events = await firebase.database().ref('groups/' + group.groupID + '/events/').once('value')
      console.log('events')
      
      events = events.val()
      console.log(events)
      if (events != null) {
        allEvents = {
          ...allEvents,
          ...events
        }
      }
      
    }
    this.setState({loader:false,events:allEvents})
    // return true
  }
  openEvent(event) {
    // if (!event.info.public) {
    //   return this.props.navigate('Alert',{close:true,title:'The event is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'Home',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    // }
    return this.props.navigate('Event',{data:event,pageFrom:'Home'})
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
        setState={(val) => {
          this.setState({[state]:val})
          this.translateViews(val)
        }}
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
  ListEvent () {
    if (!this.props.userConnected) return null
    return (
      <View style={{marginTop:20}}>
        <View style={styleApp.marginView}>

        <Text style={[styleApp.title,{marginBottom:20,marginLeft:0}]}>My events</Text>
        {this.switch('Upcoming','Past','past')}
        </View>

        <View style={{flex:1}}>
        <Animated.View style={{flex:1,backgroundColor:'white',transform:[{translateX:this.translateXView1}]}}>
        <ScrollViewX 
        loader={this.state.loader}
        events={this.state.events}
        height={180}
        openEvent={(event) => this.openEvent(event)}
        onRef={ref => (this.scrollViewRef1 = ref)}
        />
        </Animated.View>

        <Animated.View style={{flex:1,backgroundColor:'white',position:'absolute',top:0,transform:[{translateX:this.translateXView2}]}}>
        <ScrollViewX 
        height={180}
        loader={this.state.loader}
        events={this.state.eventsPast}
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
    globaleVariables:state.globaleVariables,
    userID:state.user.userID,
    userConnected:state.user.userConnected
  };
};

export default connect(mapStateToProps,{})(ListEvents);
