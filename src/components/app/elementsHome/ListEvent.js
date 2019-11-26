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
import CardEvent from './CardEvent'
import ScrollView from '../../layout/scrollViews/ScrollView'
import Button from '../../layout/Views/Button'


import AllIcons from '../../layout/icons/AllIcons'
import NavigationService from '../../../../NavigationService';

class ListEvents extends React.Component {
  state={
    events:[],
    loader:true,
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
    //'info.sport:' + 
    var events = await indexEvents.search({
      aroundLatLng: location.lat+','+location.lng,
      aroundRadius: 20*1000,
      query:'',
      filters:'info.public=1 AND ' + 'info.sport:' + sport + ' AND info.league:' + league  ,
    })
    console.log('events.hits')
    console.log(events.hits)
    await this.setState({loader:false,events:events.hits})
    return true
  }
  openEvent(event) {
    if (!event.info.public) {
      return this.props.navigate('Alert',{close:true,title:'The event is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'Home',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    }
    return this.props.navigate('Event',{data:event,pageFrom:'Home'})
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
    return (
      <View style={{marginTop:30}}>
        <Row style={{marginLeft:20,width:width-40,marginBottom:15}}>
          <Col size={85} style={styleApp.center2}>
            <Text style={[styleApp.title,{marginBottom:5,marginLeft:0,fontSize:22}]}>Events around</Text>
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
            this.state.events.length == 0?
            <View style={[styleApp.center,{marginTop:35,marginBottom:20}]}>
              <Image source={require('../../../img/images/location.png')} style={{width:65,height:65}} />
              <Text style={[styleApp.text,{marginTop:10}]}>No {this.props.sportSelected} events found</Text>
              {/* <Text style={styleApp.subtitle}>Create the first {this.props.filterSports} event in the area</Text> */}
            </View>
            :this.state.events.map((event,i) => (
              <CardEvent userCard={false} key={i} homePage={true} marginTop={25} openEvent={() => this.openEvent(event)} item={event} data={event}/>
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

const styles = StyleSheet.create({
  text:{
    fontFamily:'OpenSans-SemiBold',
    color:colors.title
  }
});

const  mapStateToProps = state => {
  return {
    globaleVariables:state.globaleVariables,
    searchLocation:state.historicSearch.searchLocation,
    sportSelected:state.historicSearch.sport,
    leagueSelected:state.historicSearch.league,
  };
};

export default connect(mapStateToProps,{historicSearchAction})(ListEvents);
