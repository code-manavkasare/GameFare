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
} from 'react-native';

import firebase from 'react-native-firebase'
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions'
import {eventsAction} from '../../../actions/eventsActions'

import {getZone} from '../../functions/location'

import Switch from '../../layout/switch/Switch'
const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import {indexEvents} from '../../database/algolia'
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/CardEvent'
import CardEvent from './CardEventSM'
import ScrollView from '../../layout/scrollViews/ScrollView'
import Button from '../../layout/Views/Button'


import AllIcons from '../../layout/icons/AllIcons'
import NavigationService from '../../../../NavigationService';

class ListEvents extends React.Component {
  state={
    events:[],
    loader:false,
    pastEvents:false,
  }
  async componentDidMount() {
    this.props.onRef(this)
    this.loadEvent(this.props.searchLocation,this.props.sportSelected,this.props.leagueSelected)
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.searchLocation.lat != nextProps.searchLocation.lat || this.props.sportSelected != nextProps.sportSelected || this.props.leagueSelected != nextProps.leagueSelected || (this.props.loader != nextProps.loader && !this.props.loader)) {
      this.loadEvent(nextProps.searchLocation,nextProps.sportSelected,nextProps.leagueSelected)
    }
  }
  reload() {
    this.loadEvent(this.props.searchLocation,this.props.sportSelected,this.props.leagueSelected)
  }
  async loadEvent(location,sport,league) {
    console.log('on reload')
    await this.setState({loader:true})
    indexEvents.clearCache()
    var leagueFilter =' AND info.league:' + league
    if (league == 'all') {
      leagueFilter = ''
    }
    var {hits} = await indexEvents.search({
      aroundLatLng: location.lat+','+location.lng,
      aroundRadius: 20*1000,
      query:'',
      filters:'info.public=1 AND ' + 'info.sport:' + sport + leagueFilter ,
    })
    console.log('hits !!!!')
    console.log(hits)
    var allEventsPublic = hits.reduce(function(result, item) {
      result[item.objectID] = item;
      return result;
    }, {});
    var publicEvents = hits.map(x => x.objectID);

    console.log('public events')
    console.log(allEventsPublic)
    console.log(publicEvents)
    await  this.props.eventsAction('setAllEvents',allEventsPublic)
    await  this.props.eventsAction('setPublicEvents',publicEvents)
    return this.setState({loader:false})
  }
  openEvent(objectID) {
    // if (!event.info.public) {
    //   return this.props.navigate('Alert',{close:true,title:'The event is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'Home',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    // }
    return this.props.navigate('Event',{objectID:objectID,pageFrom:'Home'})
  }
  async setLocation (location) {
    this.props.historicSearchAction('setLocationSearch',location)
    return NavigationService.navigate('Home')
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
        translateXComponent0={translateXComponent0}
        translateXComponent1={translateXComponent1}
        state={this.state[state]}
        setState={(val) => this.setSwitch(state,val)}
      />
    )
  }
  ListEvent () {
    var allPublicEvents = this.props.publicEvents.map(event => this.props.allEvents[event])
    return (
      <View style={{marginTop:20}}>
        <Row style={{marginLeft:20,width:width-40,marginBottom:15}}>
          <Col size={85} style={styleApp.center2}>
            <Text style={[styleApp.title,{marginBottom:5}]}>Events around</Text>
            <Text style={[styleApp.subtitle,{marginBottom:10,marginLeft:0,fontSize:12}]}>{getZone(this.props.searchLocation.address)}</Text>
          </Col>
          <Col size={15} style={styleApp.center3}>
          </Col>
        </Row>

        <View style={{marginLeft:20,marginTop:0,width:width-40,marginBottom:15}}>
        {this.switch('Public','My groups','pastEvents')}
        </View>

        { 
          this.state.loader?
          <View>
          <PlaceHolder />
          <PlaceHolder />
          <PlaceHolder />
          <PlaceHolder />
          <PlaceHolder />
          </View>
          :
          <FadeInView duration={350}>
            {
            allPublicEvents.length == 0?
            <View style={[styleApp.center,styleApp.marginView,{marginTop:35,marginBottom:20,borderBottomWidth:0.5,borderColor:colors.grey}]}>

              <Image source={require('../../../img/images/location.png')} style={{width:65,height:65}} />
              <Text style={[styleApp.text,{marginTop:10,marginBottom:20}]}>No {this.props.sportSelected} events found</Text>
              <View style={{height:6.5,borderTopWidth:0.5,borderColor:colors.grey,marginTop:0}} />
            </View>
            :allPublicEvents.map((event,i) => (
              <CardEvent size={'M'} userCard={false} key={i} homePage={true} marginTop={25} openEvent={(objectID) => this.openEvent(objectID)} item={event} data={event}/>
            ))}
          </FadeInView>
        }

        
      </View>
    )
  }
  render() {
    return this.ListEvent()
  }
}

const  mapStateToProps = state => {
  return {
    globaleVariables:state.globaleVariables,
    searchLocation:state.historicSearch.searchLocation,
    sportSelected:state.historicSearch.sport,
    leagueSelected:state.historicSearch.league,

    publicEvents:state.events.publicEvents,
    allEvents:state.events.allEvents
  };
};

export default connect(mapStateToProps,{historicSearchAction,eventsAction})(ListEvents);
