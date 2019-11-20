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
    location:{
      address:'Los Angeles, California',
      lat:34.052235,
      lng:-118.243683
    },
    search:{
      aroundLatLng: '34.052235'+','+'-118.243683',
      aroundRadius: 20*1000,
      query:'',
      // sports:[],
    }
  }
  async componentDidMount() {
    await this.setState({loader:true})
    this.loadEvent(this.state.search,this.props.filterSports)
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.loader != nextProps.loader && nextProps.loader == true) {
      await this.setState({loader:true})
      this.loadEvent(this.state.search,nextProps.filterSports)
    }
  }
  async loadEvent(search,sport) {
    console.log('on reload')
    indexEvents.clearCache()
    //'info.sport:' + 
    var events = await indexEvents.search({
      ...search,
      filters:'info.public=1 AND ' + 'info.sport:' + sport  ,
    })
    console.log('events.hits')
    console.log(events.hits)
    await this.setState({loader:false,events:events.hits})
    events = ''
    return true
  }
  openEvent(event) {
    if (!event.info.public) {
      return this.props.navigate('Alert',{close:true,title:'The event is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'Home',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    }
    return this.props.navigate('Event',{data:event,pageFrom:'Home'})
  }
  async setLocation (location) {
    var search = {
      ...this.state.search,
      hitsPerPage:20,
      aroundLatLng: location.lat+','+location.lng,
      aroundRadius: 20*1000,
    }
    await this.setState({location:location,loader:true,search:search})
    this.loadEvent(search)
    
    return NavigationService.navigate('Home')
  }
  ListEvent () {
    return (
      <View style={[styleApp.viewHome]}>
        <Row style={{marginLeft:20,width:width-40}}>
          <Col size={85} style={styleApp.center2}>
            <Text style={[styleApp.title,{marginBottom:5,marginLeft:0}]}>Upcoming events</Text>
            <Text style={[styleApp.subtitle,{marginBottom:20,marginLeft:0,fontSize:12}]}>{this.state.location.address}</Text>
          </Col>
          <Col size={15} style={styleApp.center3}>
          <Button view={() => {
                return <AllIcons name='map-marker-alt' size={16} color={colors.title} type='font' />
              }} 
              click={() => NavigationService.navigate('Location',{pageFrom:'Home',location:this.state.location,onGoBack:(location) => this.setLocation(location)})}
              color='white'
              style={[styleApp.center,{borderColor:colors.off,height:40,width:40,borderRadius:20,borderWidth:1}]}
              onPressColor={colors.off}
              />
            
          </Col>
        </Row>

        
        <View  style={{marginLeft:20,width:width-40}}>
          <View style={[styleApp.divider2,{marginTop:0,marginBottom:0}]} />
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
            <View style={[styleApp.center,{marginTop:23}]}>
              <Image source={require('../../../img/images/location.png')} style={{width:65,height:65}} />
              <Text style={[styleApp.text,{marginTop:10}]}>No events found</Text>
              <Text style={styleApp.subtitle}>Create the first {this.props.filterSports} event in the area</Text>
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
    globaleVariables:state.globaleVariables
  };
};

export default connect(mapStateToProps,{})(ListEvents);
