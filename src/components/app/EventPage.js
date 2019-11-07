import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
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

import ScrollView from '../layout/scrollViews/ScrollView'
import Header from '../layout/headers/HeaderButton'
import AllIcons from '../layout/icons/AllIcons'
import DateEvent from './elementsEventCreate/DateEvent'
import BackButton from '../layout/buttons/BackButton'
import ButtonRound from '../layout/buttons/ButtonRound'
import Button2 from '../layout/buttons/Button'
import Loader from '../layout/loaders/Loader'

import PlaceHolder from '../placeHolders/ListAttendees'

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
        <BackButton  color={colors.title} name='share' type='moon' size={16} click={() => navigation.navigate('Contacts',{pageFrom:'Event',data:{...navigation.getParam('data'),eventID:navigation.getParam('data').objectID}})} />
      ),
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  async componentDidMount() {
    this.loadEvent()
  }
  async loadEvent() {
    // await this.setState({usersConfirmed:true})
    // var usersConfirmed = await firebase.database().ref('events/' + this.props.navigation.getParam('data').objectID + '/usersConfirmed').once('value')
    // usersConfirmed = usersConfirmed.val()
    // if (usersConfirmed == null) {
    //   usersConfirmed = []
    // }
    // console.log('usersConfirmed')
    // console.log(usersConfirmed)
    // var infoOrganizer = await firebase.database().ref('users/' + this.props.navigation.getParam('data').info.organizer + '/userInfo').once('value')
    // infoOrganizer = infoOrganizer.val()
    // this.setState({usersConfirmed:usersConfirmed,infoOrganizer:infoOrganizer})
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
    var coach = 'Joined the event as a player'
    if (user.coach) {
      coach = 'Joined the event as a coach'
    }
    var level = ''
    if (user.captainInfo.level == '' || user.captainInfo.level == undefined) {
      level = "Unclassified yet"
    } else {
      level = Object.values(this.props.sports).filter(sport => sport.value == this.props.navigation.getParam('data').info.sport)[0].level.list[user.captainInfo.level].text
    }
    this.props.navigation.navigate('Alert',{textButton:'Close',title:user.captainInfo.name,subtitle:'- Level • '+ level +'\n- '+coach,close:true,onGoBack:() => this.props.navigation.navigate('Event')})
  }
  alertCoach(coach,name,icon) {
    var text = coach?'coach.':'player.'
    var title = name + ' joined the event as a ' + text
    this.props.navigation.navigate('Alert',{textButton:'Close',icon:icon,title:title,close:true,onGoBack:() => this.props.navigation.navigate('Event')})
  }
  openAlert(title,icon) {
    this.props.navigation.navigate('Alert',{textButton:'Close',title:title,icon:icon,close:true,onGoBack:() => this.props.navigation.navigate('Event')})
  }
  userCoach(user) {
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
          {/* <Col size={15} style={styleApp.center3} activeOpacity={0.7} onPress={() => this.alertCoach(user.coach == true,user.captainInfo.name,this.iconCoach(user.coach != true))}>
          {this.iconCoach(user.coach)}
          </Col> */}

          {
          user.captainInfo.userID == data.info.organizer?
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Close',close:true,onGoBack:() => this.props.navigation.navigate('Event'),title:user.captainInfo.name + ' is the organizer of the event.',icon:<AllIcons name='bullhorn' color={colors.blue} type='font' size={16}/>})}>
            <AllIcons name='bullhorn' color={colors.blue} type='font' size={16}/>
          </Col>
          :(user.status == 'confirmed' || !this.props.navigation.getParam('data').info.public)?
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Got it!',title:'This user is confirmed for the event.',subtitle:user.captainInfo.name,close:true,onGoBack:() => this.props.navigation.navigate('Event'),icon:<AllIcons name='check' type='mat' color={colors.green} size={20} />})}>
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
            <Col style={{paddingLeft:5,paddingRight:5}} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Reject',title:'Do you want to reject this attendance?',subtitle:user.captainInfo.name,onGoBack:() => this.rejectAttendance(user)})}>
              <View style={[styleApp.center,{backgroundColor:colors.primary,height:40,borderRadius:4}]}>
                <Text style={[styleApp.text,{color:'white'}]}>Reject</Text>
              </View>
            </Col>
            <Col style={{paddingLeft:5,paddingRight:5}} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Confirm',title:'Do you want to confirm this attendance?',subtitle:user.captainInfo.name,onGoBack:() => this.confirmAttendance(user)})}>
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
    if (Object.values(data.attendees).length <= Number(data.info.maxAttendance)) return true
    return false
  }
  eventInfo(data,sport) {
    var level = Object.values(sport.level.list).filter(level => level.value == data.info.levelFilter)[0]
    var rule = Object.values(sport.rules).filter(rule => rule.value == data.info.rules)[0]
    var levelOption = data.levelOption=='equal'?'only':data.levelOption=='min'?'and above':'and below'
    return (
      <View>
        <Row>
          <Col size={65} style={styleApp.center2}>
            <Text style={styleApp.title}>{data.info.name}</Text>
          </Col>
          <Col size={10} style={styleApp.center2} activeOpacity={0.7} onPress={() => this.openAlert(this.openCondition(data)?'The subscribtions are open.':'The subscribtions are closed.',this.openView(data))}>
            {this.openView(data)}
          </Col>
          <Col size={25} style={styleApp.center}>
            <View style={[styles.viewSport,{marginTop:5}]}>
              <Text style={styles.textSport}>{data.info.sport.charAt(0).toUpperCase() + data.info.sport.slice(1)}</Text>
            </View>
            <Text style={[styleApp.text,{color:colors.primary,marginTop:10,fontFamily:'OpenSans-Bold'}]}>{Number(data.price.joiningFee)==0?'Free entry':'$'+data.price.joiningFee}</Text>  
          </Col>
        </Row>
        
        {this.rowIcon(this.dateTime(data.date.start,data.date.end),'calendar-alt')}
        {this.rowIcon(this.title(data.location.area),'map-marker-alt','AlertAddress',data.location)}
        {data.info.instructions != ''?this.rowIcon(this.title(data.info.instructions),'parking'):null}

        <View style={[styleApp.divider,{marginBottom:0}]} />

        {this.rowIcon(this.title(Number(data.info.maxAttendance)==1?data.info.maxAttendance + ' player maximum':data.info.maxAttendance + ' players maximum'),'user-plus')}
        {this.rowIcon(this.title(level.value=='0'?level.text:level.text + ' ' + levelOption),'balance-scale')}
        {this.rowIcon(this.title(data.info.gender.charAt(0).toUpperCase() + data.info.gender.slice(1)),data.info.gender == 'mixed'?'venus-mars':data.info.gender == 'female'?'venus':'mars')}
        

        <View style={{height:0.3,marginTop:20,marginBottom:0,backgroundColor:colors.borderColor}} />
        
        {this.rowIcon(this.title(rule.text),'puzzle-piece')}
      </View>
    )
  }
  event(data) {
    console.log('data')
    console.log(data)
    var sport = this.props.sports.filter(sport => sport.value == data.info.sport)[0]
    console.log('sport')
    console.log(sport)
    return (
      <View>
        {this.eventInfo(data,sport)}

        <View style={[styleApp.divider,{marginBottom:20}]} />

        <Text style={[styleApp.title,{fontSize:19,marginBottom:5}]}>Coach</Text>
        {
          this.state.loader?
          <FadeInView duration={300} style={{paddingTop:10}}>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </FadeInView>
          :data.coaches == undefined?
          <Text style={[styleApp.smallText,{marginTop:5}]}>No coach has joined the event yet.</Text>
          :
          <FadeInView duration={300} style={{marginTop:0}}>
          {Object.values(data.coaches).map((user,i) => (
            this.rowUser(user,i,data)
          ))}
          </FadeInView>
        }

        <Text style={[styleApp.title,{fontSize:19,marginTop:30}]}>Players</Text>
        
        {
          this.state.loader?
          <FadeInView duration={300} style={{paddingTop:10}}>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </FadeInView>
          :data.attendees == undefined?
          <Text style={[styleApp.smallText,{marginTop:10}]}>No players has joined the event yet.</Text>
          :
          <FadeInView duration={300} style={{marginTop:0}}>
          {Object.values(data.attendees).map((user,i) => (
            this.rowUser(user,i,data)
          ))}
          </FadeInView>
        }


      </View>
    )
  }
  async confirmAttendance(user) {
    console.log('confirm attendance')
    console.log(user)
    console.log(this.props.navigation.getParam('data'))
    var infoEvent = this.props.navigation.getParam('data')
    await firebase.database().ref('events/' + infoEvent.objectID + '/usersConfirmed/' + user.teamID).update({status:'confirmed'})
    await firebase.database().ref('usersEvents/' + user.captainInfo.userID + '/' + infoEvent.objectID).update({status:'confirmed'})
    await this.setState({usersConfirmed:{
      ...this.state.usersConfirmed,
      [user.teamID]:{
        ...this.state.usersConfirmed[user.teamID],
        status:'confirmed'
      }
    }})
    if (infoEvent.info.levelFilter != undefined) {
      var newLevel = infoEvent.info.levelFilter
      if (infoEvent.info.levelOption == 'max') {
        newLevel = 1
      }
      await firebase.database().ref('users/' + user.captainInfo.userID + '/level/').update({[infoEvent.info.sport]:newLevel})
    }
    return this.props.navigation.navigate('Event')
  }
  async rejectAttendance(user) {
    console.log('confirm attendance')
    console.log(user)
    console.log(this.props.navigation.getParam('data'))
    var infoEvent = this.props.navigation.getParam('data')
    await firebase.database().ref('events/' + infoEvent.objectID + '/usersConfirmed/' + user.teamID).update({status:'rejected'})
    await firebase.database().ref('usersEvents/' + user.captainInfo.userID + '/' + infoEvent.objectID).update({status:'rejected'})
    await this.setState({usersConfirmed:{
      ...this.state.usersConfirmed,
      [user.teamID]:{
        ...this.state.usersConfirmed[user.teamID],
        status:'rejected'
      }
    }})
    return this.props.navigation.navigate('Event')
  }
  conditionAdmin() {
    if (this.props.navigation.getParam('pageFrom') != 'Home' && this.props.navigation.getParam('data').info.organizer == this.props.userID && this.props.navigation.getParam('data').info.public) return true
    return false
  }
  next() {
    if (this.props.infoUser.coach == true && this.props.infoUser.coachVerified == true && this.props.navigation.getParam('data').info.player == true) {
      return this.props.navigation.navigate('Coach',{pageFrom:'event',data:{...this.props.navigation.getParam('data'),eventID:this.props.navigation.getParam('data').objectID}})
    }
    return this.props.navigation.navigate('Checkout',{
      pageFrom:'event',
      data:{...this.props.navigation.getParam('data'),eventID:this.props.navigation.getParam('data').objectID},
      coach:{
        player:false,
      }
    })
  }
  render() {
    return (
      <View style={{ flex:1,backgroundColor:'white' }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.event(this.props.navigation.getParam('data'))}
          marginBottomScrollView={0}
          marginTop={0}
          refreshControl={true}
          refresh={this.loadEvent.bind(this)}
          offsetBottom={sizes.heightFooterBooking+60}
          showsVerticalScrollIndicator={false}
        />

        {
          this.state.loader?
          null
          :!this.openCondition(this.props.navigation.getParam('data'))?
          null
          :this.props.navigation.getParam('pageFrom') == 'Home'?
          <FadeInView duration={300} style={styleApp.footerBooking}>
          <Button2
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          disabled={false} 
          text='Join the event'
          loader={false} 
          click={() => this.next()}
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
});


const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
    userID:state.user.userID,
    infoUser:state.user.infoUser.userInfo
  };
};

export default connect(mapStateToProps,{})(EventPage);
