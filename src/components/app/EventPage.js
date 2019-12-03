import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Button
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase'

const { height, width } = Dimensions.get('screen')
import colors from '../style/colors'
import styleApp from '../style/style'
import sizes from '../style/sizes'
import {Grid,Row,Col} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';
import MapboxGL from '@react-native-mapbox-gl/maps';
import AsyncImage from '../layout/image/AsyncImage'
MapboxGL.setAccessToken('pk.eyJ1IjoiYmlyb2xsZWF1ZiIsImEiOiJjampuMHByenoxNmRoM2ttcHVqNmd0bzFvIn0.Fml-ls_j4kW_OJViww4D_w');
import AsyncStorage from '@react-native-community/async-storage';

import ScrollView from '../layout/scrollViews/ScrollView2'
import AllIcons from '../layout/icons/AllIcons'
import DateEvent from './elementsEventCreate/DateEvent'
import BackButton from '../layout/buttons/BackButton'
import Button2 from '../layout/buttons/Button'
import Loader from '../layout/loaders/Loader'
import isEqual from 'lodash.isequal'
import LinearGradient from 'react-native-linear-gradient';

import {indexEvents} from '../database/algolia'
import PlaceHolder from '../placeHolders/ListAttendees'

import ParalaxScrollView from '../layout/scrollViews/ParalaxScrollView'
import HeaderBackButton from '../layout/headers/HeaderBackButton'

class EventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed:true,
      loader:false,
      location:[-122.400021, 37.789085],
      imageMap:'',
    };
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: '',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerRight: () => (
        <BackButton  color={colors.title} name='share' type='moon' size={16} click={() => navigation.navigate('Contacts',{openPageLink:'openEventPage',pageFrom:'Event',data:{...navigation.getParam('data'),eventID:navigation.getParam('data').objectID}})} />
      ),
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  async componentDidMount() {
    console.log('event page mount')
    console.log(this.props.navigation.getParam('data'))
    // this.loadEvent(this.props.navigation.getParam('data'))
    var uri = await AsyncStorage.getItem(this.props.navigation.getParam('data').objectID)
    if(uri == null) {
      uri = await MapboxGL.snapshotManager.takeSnap({
        centerCoordinate: [this.props.navigation.getParam('data').location.lng, this.props.navigation.getParam('data').location.lat],
        width: width-20,
        height: 300,
        zoomLevel: 12,
        pitch: 30,
        heading: 20,
        // styleURL: MapboxGL.StyleURL.Dark,
        writeToDisk: true, // Create a temporary file
      });
      
      AsyncStorage.setItem(this.props.navigation.getParam('data').objectID, uri)
    }
    console.log('uri!!!!!!')
    console.log(uri)
    
    this.setState({imageMap:uri})
  }
  async loadEvent(data,refresh) {
    if (refresh) {
      await this.props.navigation.setParams({loader:true})
    }
    indexEvents.clearCache()
    var event = await indexEvents.getObject(data.objectID)
    if (!isEqual(data,event)) {
      await this.props.navigation.setParams({data:event,loader:false})
    } else {
      await this.props.navigation.setParams({loader:false})
    }
    return true
  }
  cancel() {
    console.log('cancel!!!!')
    this.props.navigation.navigate('Event')
  }
  rowIcon (component,icon,alert,dataAlert) {
    console.log('Alert')
    console.log(alert)
    console.log(dataAlert)
    return (
      <TouchableOpacity style={{marginTop:20}} activeOpacity={alert!=undefined?0.7:1} onPress={() => alert!=undefined?this.props.navigation.navigate('AlertAddress',{data:dataAlert}):null}>
        <Row>
          <Col size={10} style={styleApp.center2}>
            <AllIcons name={icon} color={colors.greyDark} size={16} type='font' />
          </Col>
          <Col size={90} style={styleApp.center2}>
            {component}
          </Col>
        </Row>
      </TouchableOpacity>
    )
  }
  colIcon (text,icon) {
    return (
          <Col style={styleApp.center} size={50}>
            <View style={[styleApp.center,{marginBottom:15}]}>
              <View style={[styleApp.center,styles.roundView]}>
                <AllIcons name={icon} size={17} color={colors.title} type='font' />
              </View>       
            </View>
            <Text style={styleApp.text}>{text}</Text>
          </Col>
    )
  }
  title(text) {
    return <Text style={styleApp.input}>{text}</Text>
  }
  dateTime(start,end) {
    return <DateEvent 
    start={start}
    end={end}
    />
  }
  iconCoach(val) {
    if (val) return <View style={[styleApp.roundView,{backgroundColor:colors.secondary}]}>
        <Text style={[styleApp.text,{color:'white',fontSize:10}]}>P</Text>
      </View>
    return <View style={[styleApp.roundView,{backgroundColor:colors.green}]}>
          <Text style={[styleApp.text,{color:'white',fontSize:10}]}>C</Text>
        </View>
  }
  
  openView(data) {
    return <AllIcons name={this.openCondition(data)?'lock-open':'lock'} type='font' color={this.openCondition(data)?colors.green:colors.primary} size={18} />
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
  alertCoach(coach,name,icon) {
    var text = coach?'instructor.':'player.'
    var title = name + ' joined the event as a ' + text
    this.props.navigation.navigate('Alert',{textButton:'Close',icon:icon,title:title,close:true,onGoBack:() => this.props.navigation.navigate('Event')})
  }
  openAlert(title,icon) {
    this.props.navigation.navigate('Alert',{textButton:'Close',title:title,icon:icon,close:true,onGoBack:() => this.props.navigation.navigate('Event')})
  }
  allowCall(user,data) {
    if (user.coach || user.captainInfo.userID == data.info.organizer) return true
    return  false
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
          <Col size={55} style={styleApp.center2}>
            <Text style={styleApp.text}>{user.captainInfo.name}</Text>
          </Col>
          <Col size={10} style={styleApp.center3} activeOpacity={0.7} onPress={() => !this.allowCall(user,data)?null:this.props.navigation.navigate('AlertCall',{textButton:'Close',title:user.captainInfo.name,subtitle:user.captainInfo.phoneNumber,close:true,icon:<AllIcons name='envelope' type='font' color={colors.green} size={17} />})}>
          {this.allowCall(user,data)?<AllIcons name='envelope' type='font' color={colors.green} size={17} />:null}
          </Col>
          

          {
          user.captainInfo.userID == data.info.organizer?
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Close',close:true,onGoBack:() => this.props.navigation.navigate('Event'),title:user.captainInfo.name + ' is the organizer of the event.',icon:<AllIcons name='bullhorn' color={colors.blue} type='font' size={16}/>})}>
            <AllIcons name='bullhorn' color={colors.blue} type='font' size={16}/>
          </Col>
          :(user.status == 'confirmed' || !this.props.navigation.getParam('data').info.public)?
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
  eventInfo(data,sport,rule) {
    var level = Object.values(sport.level.list).filter(level => level.value == data.info.levelFilter)[0]
    var levelOption = data.info.levelOption=='equal'?'only':data.info.levelOption=='min'?'and above':'and below'
    console.log('level')
    console.log(data)
    console.log(rule)
    return (
      <View style={[{backgroundColor:'white',borderTopWidth:0.3,borderColor:colors.borderColor}]}>
        <View style={styleApp.marginView} >

            <Row style={{marginTop:20}}>
              <Col size={75} style={styleApp.center2}>
                <Text style={styleApp.title}>{data.info.name}</Text>
              </Col>
              <Col size={25} style={styleApp.center3} activeOpacity={0.7} onPress={() => this.openAlert(this.openCondition(data)?'The subscribtions are open.':'The subscribtions are closed.',this.openView(data))}>
                {this.openView(data)}
              </Col>
            </Row>

            <Row style={{marginTop:20}}>
              <Col size={25} style={styleApp.center2}>
                <View style={[styles.viewSport,{marginTop:5,backgroundColor:sport.card.color.color}]}>
                  <Text style={[styles.textSport,{color:'white'}]}>{data.info.sport.charAt(0).toUpperCase() + data.info.sport.slice(1)}</Text>
                </View>
              </Col>
              <Col size={75} style={styleApp.center3}>            
                <Text style={[styleApp.text,{color:colors.primary,marginTop:10,fontFamily:'OpenSans-Bold',fontSize:18}]}>{Number(data.price.joiningFee)==0?'Free entry':'$'+data.price.joiningFee}</Text>  
              </Col>
            </Row>

            <View style={[styleApp.divider2,{marginBottom:10}]} />

            {this.rowIcon(this.dateTime(data.date.start,data.date.end),'calendar-alt')}
            {data.date.recurrence != '' && data.date.recurrence != undefined?this.rowIcon(this.title(data.date.recurrence.charAt(0).toUpperCase() + data.date.recurrence.slice(1)),'stopwatch'):null}
            {this.rowIcon(this.title(data.location.address),'map-marker-alt','AlertAddress',data.location)}
            {data.info.instructions != ''?this.rowIcon(this.title(data.info.instructions),'parking'):null}


          <View style={[styleApp.divider2,{marginBottom:10}]} />

          <Row style={{height:100,marginTop:20}}>
            {this.colIcon(Number(data.info.maxAttendance)==1?data.info.maxAttendance + ' player':data.info.maxAttendance + ' players','user-plus')}
            {this.colIcon(level.value=='0'?level.text:level.text.split('/')[0],'balance-scale')}
          </Row>

          <Row style={{height:100,marginTop:20,}}>
            {this.colIcon(data.info.gender.charAt(0).toUpperCase() + data.info.gender.slice(1),data.info.gender == 'mixed'?'venus-mars':data.info.gender == 'female'?'venus':'mars')}
            {this.colIcon(rule.text,'puzzle-piece')}
          </Row>

        </View>     
      </View>
    )
  }
  event(data,loader,sport,league,rule) {
    console.log('data')
    console.log(data)
    
    console.log('sport')
    console.log(sport)
    return (
      <View style={{marginLeft:0,width:width,marginTop:-15}}>
        {/* {this.imageMap(data)} */}
        {this.eventInfo(data,sport,rule)}

        {
        rule.coachNeeded?
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>

          <Text style={styleApp.text}>Instructor</Text>

          <View style={[styleApp.divider2,{marginBottom:10}]} />
            {
            loader?
            <FadeInView duration={300} style={{paddingTop:10}}>
              <PlaceHolder />
            </FadeInView>
            :data.coaches == undefined?
            <Text style={[styleApp.smallText,{marginTop:5}]}>No instructor has joined the event yet.</Text>
            :
            <FadeInView duration={300} style={{marginTop:0}}>
            {Object.values(data.coaches).map((user,i) => (
              this.rowUser(user,i,data)
            ))}
            </FadeInView>
          }

          </View>
        </View>
        :null
        }

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>

          <Text style={styleApp.text}>Players</Text>

          <View style={[styleApp.divider2,{marginBottom:10}]} />
          {
            loader?
            <FadeInView duration={300} style={{paddingTop:10}}>
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
            </FadeInView>
            :data.attendees == undefined?
            <Text style={[styleApp.smallText,{marginTop:10}]}>No players has joined the event yet.</Text>
            :
            <FadeInView duration={300} style={{marginTop:5}}>
            {Object.values(data.attendees).map((user,i) => (
              this.rowUser(user,i,data)
            ))}
            </FadeInView>
          }

          </View>
        </View>
        
        <View style={{height:sizes.heightFooterBooking+50}} />

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
  next(data,sport,rule) {
    if (this.props.infoUser.coach == true && this.props.infoUser.coachVerified == true && this.props.navigation.getParam('data').info.player == true && rule.coachNeeded) {
      return this.props.navigation.navigate('Coach',{pageFrom:'event',data:{...this.props.navigation.getParam('data'),eventID:this.props.navigation.getParam('data').objectID}})
    }
    return this.props.navigation.navigate('Checkout',{
      pageFrom:'event',
      data:{...this.props.navigation.getParam('data'),eventID:this.props.navigation.getParam('data').objectID},
      coach:{
        player:true,
      }
    })
  }
  async joinWaitlist () {
    if (!this.props.userConnected) return this.props.navigation.navigate('SignIn',{pageFrom:'Event'})
    await firebase.database().ref('events/' + this.props.navigation.getParam('data').objectID + '/waitlist').push({
      userID:this.props.userID,
      date:(new Date()).toString(),
      nameUser:this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
      nameEvent:this.props.navigation.getParam('data').info.name,
    })
    return this.props.navigation.navigate('Alert',{textButton:'Got it!',title:"You are now waitlisted for the event. We will notify you if a spot becomes available.",close:true})
  }
  waitlistCondition() {
    if (!this.openCondition(this.props.navigation.getParam('data')) && this.props.navigation.getParam('data').info.organizer !== this.props.userID) {
      if (this.props.navigation.getParam('data').attendees == undefined) return true
      if (Object.values(this.props.navigation.getParam('data').attendees).filter(user => user.captainInfo.userID === this.props.userID).length == 0) return true
    }
    return false
  }
  render() {
    var sport = this.props.sports.filter(sport => sport.value == this.props.navigation.getParam('data').info.sport)[0]

    var league = Object.values(sport.typeEvent).filter(item => item.value == this.props.navigation.getParam('data').info.league)[0]
    var rule = Object.values(league.rules).filter(rule => rule.value == this.props.navigation.getParam('data').info.rules)[0]
    return (
      <View style={{ flex:1}}>

        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        close={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
        textHeader={this.props.navigation.getParam('data').info.name}
        inputRange={[50,80]}
        initialBorderColorIcon={colors.grey}
        initialBackgroundColor={'transparent'}
        typeIcon2={'moon'}
        sizeIcon2={17}
        initialTitleOpacity={0}
        icon1='arrow-left'
        icon2='share'

        clickButton2={() => this.props.navigation.navigate('Contacts',{openPageLink:'openEventPage',pageFrom:'Event',data:{...this.props.navigation.getParam('data'),eventID:this.props.navigation.getParam('data').objectID}})}
        clickButton1={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))} 
        />
       
      <ParalaxScrollView 
        setState={(val) => this.setState(val)} 
        
        image={
          this.state.imageMap!=''?
          <TouchableOpacity activeOpacity={0.3} style={{height:280,width:'100%'}}  onPress={() => {this.props.navigation.navigate('AlertAddress',{data:this.props.navigation.getParam('data').location})}}>
             <AsyncImage style={{width:'100%',height:300,borderRadius:0}} mainImage={this.state.imageMap} imgInitial={this.state.imageMap} />
             <View style={{position:"absolute",left:width/2-15,top:280/2-5}}>
                <AllIcons name='map-marker-alt' type='font' size={28} color={colors.blue} />
              </View>
            </TouchableOpacity>
          :
          <FadeInView duration={250}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{width:'100%',height:300,borderRadius:0}} />
            <View style={{position:"absolute",left:width/2-15,top:280/2-5}}>
              <Loader size={28} color={'primary'} />
            </View>
          </FadeInView>
        }

        content={() => this.event(this.props.navigation.getParam('data'),this.props.navigation.getParam('loader'),sport,league,rule)} 
        header={false}
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        
        initialColorIcon={colors.title}
        colorRefreshControl ={colors.title}
        
        
      />
       

        {
          this.props.navigation.getParam('loader')?
          null
          :this.waitlistCondition()?
          <FadeInView duration={300} style={styleApp.footerBooking}>
          <Button2
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          disabled={false} 
          text='Join the waitlist'
          loader={false} 
          click={() => this.joinWaitlist()}
         />
         </FadeInView>
          :this.openCondition(this.props.navigation.getParam('data')) && this.props.navigation.getParam('pageFrom') == 'Home' || this.props.navigation.getParam('pageFrom') == 'Group'?
          <FadeInView duration={300} style={styleApp.footerBooking}>
          <Button2
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          disabled={false} 
          text='Join the event'
          loader={false} 
          click={() => this.next(this.props.navigation.getParam('data'),sport,rule)}
         />
         </FadeInView>
         :null
        }
        
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
  roundView:{
    height:50,width:50,backgroundColor:colors.off,borderRadius:25,borderColor:colors.grey,borderWidth:0.7,
  }
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
