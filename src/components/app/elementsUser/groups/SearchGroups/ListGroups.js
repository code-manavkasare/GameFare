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
import colors from '../../../../style/colors'
import sizes from '../../../../style/sizes'
import styleApp from '../../../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import {indexGroups} from '../../../../database/algolia'
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../../../placeHolders/CardEvent'
import CardGroup from '../CardGroup'
import Button from '../../../../layout/Views/Button'
import AllIcons from '../../../../layout/icons/AllIcons'
import NavigationService from '../../../../../../NavigationService';

class ListEvents extends React.Component {
  state={
    events:[],
    loader:false,
    location:{
      address:'Los Angeles, California',
      lat:34.052235,
      lng:-118.243683
    },
    search:{
      aroundLatLng: '34.052235'+','+'-118.243683',
      aroundRadius: 20*1000,
      // filters:'info.sport:' + 'tennis' + ' OR info.sport:' + 'soccer' + " ",
      query:'',
      // sports:[],
    }
  }
  async componentDidMount() {
    this.setState({loader:true})
    this.loadEvent(this.state.search)
  }
  async loadEvent(search) {
    console.log('on reload')
    indexGroups.clearCache()
    var events = await indexGroups.search({
      ...search,
    })
    console.log('events.hits')
    console.log(events.hits)
    await this.setState({events:events.hits,loader:false})
    events = ''
    return true
  }
  openEvent(event) {
    if (!event.info.public) {
      return NavigationService.navigate('Alert',{close:true,title:'The group is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'ListGroups',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    }
    return NavigationService.navigate('Group',{data:event,pageFrom:'ListGroups',loader:true})
  }
  async setLocation (location) {
    console.log('location')
    console.log(location)
    var search = {
      ...this.state.search,
      hitsPerPage:20,
      aroundLatLng: location.lat+','+location.lng,
      aroundRadius: 20*1000,
    }
    await this.setState({location:location,loader:true,search:search})
    this.loadEvent(search)
    
    return NavigationService.navigate('ListGroups')
  }
  ListEvent () {
    return (
      <View style={[styleApp.viewHome]}>
        <Row style={{marginLeft:20,width:width-60}}>
          <Col size={85} style={styleApp.center2}>
            <Text style={[styleApp.text,{marginBottom:5,marginLeft:0}]}>Popular groups</Text>
            <Text style={[styleApp.subtitle,{marginBottom:20,marginLeft:0}]}>{this.state.location.address}</Text>
          </Col>
          <Col size={15} style={styleApp.center3}>
          <Button view={() => {
                return <AllIcons name='map-marker-alt' size={16} color={colors.title} type='font' />
              }} 
              click={() => NavigationService.navigate('Location',{pageFrom:'ListGroups',location:this.state.location,onGoBack:(location) => this.setLocation(location)})}
              color='white'
              style={[styleApp.center,{borderColor:colors.off,height:40,width:40,borderRadius:20,borderWidth:1}]}
              onPressColor={colors.off}
              />
            
          </Col>
        </Row>


        { 
          this.state.loader?
          <View>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </View>
          :
          <FadeInView duration={350}>
            {this.state.events.map((event,i) => (
              <CardGroup loadData={false} key={i} homePage={true} marginTop={25} clickGroup={() => this.openEvent(event)} item={event} data={event}/>
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
