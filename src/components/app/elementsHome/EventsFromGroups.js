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
import {indexEvents} from '../../database/algolia'
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/CardEvent'
import CardEvent from './CardEventSM'
import Button from '../../layout/Views/Button'


import AllIcons from '../../layout/icons/AllIcons'
import NavigationService from '../../../../NavigationService';

class ListEvents extends React.Component {
  state={
    events:[],
    loader:true,
  }
  async componentDidMount() {
    await this.setState({loader:true})
    if (!this.props.userConnected) return this.setState({loader:false})
    this.loadEvent()
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.loader != nextProps.loader && nextProps.loader == true) {
      await this.setState({loader:true})
      this.loadEvent()
    } else if (this.props.userConnected != nextProps.userConnected && nextProps.userConnected == true) {
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
    if (!event.info.public) {
      return this.props.navigate('Alert',{close:true,title:'The event is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'Home',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    }
    return this.props.navigate('Event',{data:event,pageFrom:'Home'})
  }
  ListEvent () {
    if (!this.props.userConnected) return null
    return (
      <View style={{marginTop:20}}>
        <View style={styleApp.marginView}>

        
        <Text style={[styleApp.title,{marginBottom:5,marginLeft:0}]}>My groups events</Text>

        


        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginLeft:-20,width:width,paddingLeft:20,paddingRight:20,marginTop:15}}>
          {
          this.state.loader?
          [0,1,2,3].map((event,i) => (
            <View key={i} style={[styles.cardSport,styleApp.center,{backgroundColor:'white'}]} >
              <PlaceHolder />
            </View>
          ))
          :!this.props.userConnected?
          <Button view={() => {
            return (
              <View style={styleApp.center}>
                <Image source={require('../../../img/images/smartphone.png')} style={{width:100,height:100,marginBottom:10}} />

                <Text style={[styleApp.text,{marginTop:5}]}>Sign in to see your events</Text>
              </View>
            )
          }} 
          click={() => NavigationService.navigate('SignIn',{pageFrom:'Home'})}
          color='white'
          style={[styles.cardSport,styleApp.center,{backgroundColor:colors.off2,borderWidth:0,borderColor:colors.borderColor,width:width-40}]}
          onPressColor={colors.off}
          />
          :
          Object.values(this.state.events).map((event,i) => (
            <CardEvent userCard={false} key={i} loadData={true} homePage={true} openEvent={(event) => this.openEvent(event)} item={event}/>
          ))

          }
          <View style={{width:30}}/>
        </ScrollView>  

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
