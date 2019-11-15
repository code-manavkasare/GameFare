import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Button,
    RefreshControl
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase'

const { height, width } = Dimensions.get('screen')
import colors from '../style/colors'
import styleApp from '../style/style'
import sizes from '../style/sizes'
import {Grid,Row,Col} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import ScrollView from '../layout/scrollViews/ScrollView2'
import AsyncImage from '../layout/image/AsyncImage'
import AllIcons from '../layout/icons/AllIcons'
import BackButton from '../layout/buttons/BackButton'
import Button2 from '../layout/buttons/Button'
import ButtonColor from '../layout/Views/Button'
import Loader from '../layout/loaders/Loader'
import isEqual from 'lodash.isequal'
import ParallaxScrollView from 'react-native-parallax-scroll-view';

import {indexGroups} from '../database/algolia'
import PlaceHolder from '../placeHolders/ListAttendees'

import DescriptionView from './elementsGroupPage/DescriptionView'
import MembersView from './elementsGroupPage/MembersView'
import PostsView from './elementsGroupPage/PostsView'
import EventsView from './elementsGroupPage/EventsView'

class EventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed:true,
      loader:false,
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('data').info.name,
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerRight: () => (
        <BackButton  color={colors.title} name='share' type='moon' size={16} click={() => navigation.navigate('Contacts',{openPageLink:'openGroupPage',pageFrom:'Group',data:{...navigation.getParam('data'),eventID:navigation.getParam('data').objectID}})} />
      ),
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  async componentDidMount() {
    this.loadEvent(this.props.navigation.getParam('data'))
  }
  async loadEvent(data,refresh) {
    if (refresh) {
      await this.props.navigation.setParams({loader:true})
    }
    indexGroups.clearCache()
    var event = await indexGroups.getObject(data.objectID)

    await this.props.navigation.setParams({data:event,loader:false})
    return true
  }
  rowIcon (component,icon,alert,dataAlert) {
    console.log('Alert')
    console.log(alert)
    console.log(dataAlert)
    return (
      <TouchableOpacity style={{marginTop:20}} activeOpacity={alert!=undefined?0.7:1} onPress={() => alert!=undefined?this.props.navigation.navigate('AlertAddress',{data:dataAlert}):null}>
        <Row>
          <Col size={10} style={styleApp.center2}>
            <AllIcons name={icon} color={colors.grey} size={18} type='font' />
          </Col>
          <Col size={90} style={styleApp.center2}>
            {component}
          </Col>
        </Row>
      </TouchableOpacity>
    )
  }
  title(text) {
    return <Text style={[styleApp.title,{fontSize:15,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
  }
  openProfile(user) {
    console.log('user!! ')
    console.log(user)
    var coach = 'Joined the event as a player'
    if (user.coach) {
      coach = 'Joined the event as an instructor'
    }
    var level = ''
    if (user.captainInfo.level == '' || user.captainInfo.level == undefined) {
      level = "Unclassified yet"
    } else {
      level = Object.values(this.props.sports).filter(sport => sport.value == this.props.navigation.getParam('data').info.sport)[0].level.list[user.captainInfo.level].text
    }
    var subtitle = '- Level • '+ level +'\n- '+coach
    if (user.coach) {
      subtitle = '- ' + coach
    }
    this.props.navigation.navigate('Alert',{textButton:'Close',title:user.captainInfo.name,subtitle:subtitle,close:true,onGoBack:() => this.props.navigation.navigate('Event')})
  }
  rowUser(user,i,data) {
    console.log('userrrrrrrr')
    console.log(user)
    console.log(data)
    return (
      <TouchableOpacity key={i} style={[styleApp.cardSelectFlex,{paddingTop:10,paddingBottom:10,flex:1,marginTop:10,minHeight:50}]} activeOpacity={0.7} onPress={() => this.openProfile(user)}>
        <Row>
          <Col size={15} style={styleApp.center}>
            <AllIcons name='user-circle' color={colors.grey} type='font' size={20}/>
          </Col>
          <Col size={65} style={styleApp.center2}>
            <Text style={styleApp.text}>{user.captainInfo.name}</Text>
          </Col>

          {
          user.status == 'confirmed' ?
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Got it!',title:'This user is confirmed for the event.',subtitle:user.captainInfo.name,close:true,icon:<AllIcons name='check' type='mat' color={colors.green} size={20} />})}>
            <AllIcons name='check' type='mat' color={colors.green} size={20} />
          </Col>
          :user.status == 'rejected'?
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Got it!',title:'This user has been rejected by the organizer.',subtitle:user.captainInfo.name,close:true,onGoBack:() => this.props.navigation.navigate('Event'),icon:<AllIcons name='close' type='mat' color={colors.primary} size={20} />})}>
            <AllIcons name='close' type='mat' color={colors.primary} size={20} />
          </Col>
          :
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Got it!',title:"This user is waiting for the organizer's aproval.",subtitle:user.captainInfo.name,close:true,onGoBack:() => this.props.navigation.navigate('Event'),icon:<AllIcons name='clock' type='font' color={colors.secondary} size={20} />})}>
            <AllIcons name='clock' type='font' color={colors.secondary} size={20} />
          </Col>
          }
      </Row>


        {
          this.conditionAdmin() && user.status != 'confirmed' && user.status != 'rejected'?
          <Row style={{height:40,marginTop:15}}>
            <Col style={{paddingLeft:5,paddingRight:5}} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Reject',title:'Do you want to reject this attendance?',subtitle:user.captainInfo.name,onGoBack:() => this.rejectAttendance(user,data)})}>
              <View style={[styleApp.center,{backgroundColor:colors.primary,height:40,borderRadius:4}]}>
                <Text style={[styleApp.text,{color:'white'}]}>Reject</Text>
              </View>
            </Col>
            <Col style={{paddingLeft:5,paddingRight:5}} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Confirm',title:'Do you want to confirm this attendance?',subtitle:user.captainInfo.name,onGoBack:() => this.confirmAttendance(user,data)})}>
              <View style={[styleApp.center,{backgroundColor:colors.green,height:40,borderRadius:4}]}>
                <Text style={[styleApp.text,{color:'white'}]}>Confirm</Text>
              </View>
            </Col>
          </Row>
          :null
        }
      </TouchableOpacity>
    )
  }
  openCondition(data) {
    if (data.attendees == undefined) return true
    if (Object.values(data.attendees).length < Number(data.info.maxAttendance)) return true
    return false
  }
  eventInfo(data,sport) {
    return (
      <View style={{marginTop:-10}}>


        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>

            <Row>
              <Col size={75} style={[styleApp.center2,{paddingRight:10}]}>
                <Text style={styleApp.title}>{data.info.name}</Text>
              </Col>
              <Col size={25} style={styleApp.center3}>
                <View style={[styles.viewSport,{marginTop:5,backgroundColor:sport.card.color.backgroundColor}]}>
                  <Text style={[styles.textSport,{color:sport.card.color.color}]}>{data.info.sport.charAt(0).toUpperCase() + data.info.sport.slice(1)}</Text>
                </View>
              </Col>
            </Row>

            <View style={[styleApp.divider2,{marginBottom:10}]} />
            {this.rowIcon(this.title(data.location.area),'map-marker-alt','AlertAddress',data.location)}
            {this.rowIcon(this.title(data.organizer.name),'user-alt','AlertAddress',data.location)}

          </View>
        </View>

                
      </View>
    )
  }
  event(data,loader) {
    var sport = this.props.sports.filter(sport => sport.value == data.info.sport)[0]
    return (
      <View style={{width:width,marginTop:-5}}>
        <View style={[styleApp.viewHome,{marginBottom:10,paddingTop:0,paddingBottom:0,overflow: 'hidden'}]}>
        <AsyncImage style={{width:'100%',height:270,borderRadius:16}} mainImage={this.props.navigation.getParam('data').pictures[0]} imgInitial={this.props.navigation.getParam('data').pictures[0]} />
        </View>

        {this.eventInfo(data,sport)}

        <DescriptionView objectID={data.objectID} loader={this.state.loader}/>

        <EventsView 
          data={data} 
          objectID={data.objectID} 
          userID={this.props.userID} 
          loader={this.state.loader}
          userConnected={this.props.userConnected}
          sport={sport}
          navigate={(val,data) => this.props.navigation.navigate(val,data)} 
          push={(val,data) => this.props.navigation.push(val,data)}
        />

        <MembersView 
          data={data} 
          objectID={data.objectID} 
          userID={this.props.userID}  
          loader={this.state.loader} 
          infoUser={this.props.infoUser}
          userConnected={this.props.userConnected}
        />

        <PostsView 
          objectID={data.objectID} 
          loader={this.state.loader}
          infoUser={this.props.infoUser}
          userConnected={this.props.userConnected}
        />


      </View>
    )
  }
  async confirmAttendance(user,data) {
    var section = user.coach?'coaches':'attendess'
    await firebase.database().ref('events/' + data.objectID + '/'+section+'/' + user.teamID).update({status:'confirmed'})
    await firebase.database().ref('usersEvents/' + user.captainInfo.userID + '/' + data.objectID).update({status:'confirmed'})

    await this.props.navigation.setParams({data:{
      ...this.props.navigation.getParam('data'),
      [section]:{
        ...data[section],
        [user.teamID]:{
          ...data[section][user.teamID],
          status:'confirmed'
        }
      }
    }})
    if (data.info.levelFilter != undefined) {
      var newLevel = data.info.levelFilter
      if (data.info.levelOption == 'max') {
        newLevel = 1
      }
      await firebase.database().ref('users/' + user.captainInfo.userID + '/level/').update({[data.info.sport]:newLevel})
    }
    return this.props.navigation.navigate('Event')
  }
  async rejectAttendance(user,data) {
    var section = user.coach?'coaches':'attendess'
    await firebase.database().ref('events/' + data.objectID + '/'+section+'/' + user.teamID).update({status:'rejected'})
    await firebase.database().ref('usersEvents/' + user.captainInfo.userID + '/' + data.objectID).update({status:'rejected'})
    await this.props.navigation.setParams({data:{
      ...this.props.navigation.getParam('data'),
      [section]:{
        ...data[section],
        [user.teamID]:{
          ...data[section][user.teamID],
          status:'rejected'
        }
      }
    }})
    return this.props.navigation.navigate('Event')
  }
  conditionAdmin() {
    if (this.props.navigation.getParam('pageFrom') != 'Home' && this.props.navigation.getParam('data').info.organizer == this.props.userID && this.props.navigation.getParam('data').info.public) return true
    return false
  }
  async refresh() {
    await this.setState({loader:true})
    return this.setState({loader:false})
  }
  refreshControl() {
    return (
      <RefreshControl
        refreshing={this.state.loader}
        colors={['white']}
        progressBackgroundColor={'white'}
        tintColor='white'
        onRefresh={()=>this.refresh()} size={'small'} />
    )
  }
  render() {
    return (
      <View style={{height:'100%'}}>
      {/* <ParallaxScrollView
      backgroundColor={'white'}
      contentBackgroundColor={'white'}
      parallaxHeaderHeight={0}
      style={{backgroundColor:'white'}}
      showsVerticalScrollIndicator={false}
      refreshControl={this.refreshControl()}
      // renderBackground={() => (
        
      // )}
      stickyHeaderHeight={88}
      >
       {this.event(this.props.navigation.getParam('data'),this.props.navigation.getParam('loader'))}
    </ParallaxScrollView> */}
      <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.event(this.props.navigation.getParam('data'),this.props.navigation.getParam('loader'))}
          marginBottomScrollView={0}
          marginTop={0}
          refreshControl={true}
          refresh={() => this.refresh()}
          colorRefresh={colors.primary}
          offsetBottom={90}
          showsVerticalScrollIndicator={false}
        />
    </View>
    );
  }
}

const styles = StyleSheet.create({
  viewSport:{
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    height:25,
    width:70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
});


const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
    userID:state.user.userID,
    infoUser:state.user.infoUser.userInfo,
    userConnected:state.user.userConnected
  };
};

export default connect(mapStateToProps,{})(EventPage);
