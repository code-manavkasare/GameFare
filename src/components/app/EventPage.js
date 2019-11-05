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

import ScrollView from '../layout/scrollViews/ScrollView'
import Header from '../layout/headers/HeaderButton'
import AllIcons from '../layout/icons/AllIcons'
import DateEvent from './elementsEventCreate/DateEvent'
import BackButton from '../layout/buttons/BackButton'
import ButtonRound from '../layout/buttons/ButtonRound'
import Button2 from '../layout/buttons/Button'
import Loader from '../layout/loaders/Loader'

class EventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed:true,
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('data').info.name,
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      headerRight: () => (
        <BackButton name='share' type='moon' size={18} click={() => navigation.navigate('Contacts',{pageFrom:'Event',data:{...navigation.getParam('data'),eventID:navigation.getParam('data').objectID}})} />
      ),
      headerLeft: () => (
        <BackButton name='keyboard-arrow-left' type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  async componentDidMount() {
    this.loadEvent()
  }
  async loadEvent() {
    await this.setState({usersConfirmed:true})
    var usersConfirmed = await firebase.database().ref('events/' + this.props.navigation.getParam('data').objectID + '/usersConfirmed').once('value')
    usersConfirmed = usersConfirmed.val()
    if (usersConfirmed == null) {
      usersConfirmed = []
    }
    console.log('usersConfirmed')
    console.log(usersConfirmed)
    var infoOrganizer = await firebase.database().ref('users/' + this.props.navigation.getParam('data').info.organizer + '/userInfo').once('value')
    infoOrganizer = infoOrganizer.val()
    this.setState({usersConfirmed:usersConfirmed,infoOrganizer:infoOrganizer})
  }
  cancel() {
    console.log('cancel!!!!')
    this.props.navigation.navigate('Event')
  }
  rowIcon (component,icon) {
    return (
      <Row style={{marginTop:20}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name={icon} color={colors.grey} size={18} type='font' />
        </Col>
        <Col size={90} style={styleApp.center2}>
          {component}
        </Col>
      </Row>
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
  getIconField(field,step2) {
    var icon = field.icon
    if (field.field == 'expandable') {
      icon = field.list.filter(field1 => field1.value == step2[field.value])[0].icon
    }
    return icon
  }
  getTextField(field,step2) {
    if (field.field == 'plus') {
      return step2[field.value] + ' ' + field.value
    }
    return step2[field.value].charAt(0).toUpperCase() + step2[field.value].slice(1)
  }
  rowOrganizer() {
    if (this.state.usersConfirmed == true) return null
    return (
    <TouchableOpacity style={[styleApp.cardSelect,{paddingTop:10,paddingBottom:10,flex:1,marginTop:20}]} >
    <Row>
      <Col size={15} style={styleApp.center}>
        <AllIcons name='user-circle' color={colors.grey} type='font' size={20}/>
      </Col>
      <Col size={50} style={styleApp.center2}>
        <Text style={styleApp.text}>{this.state.infoOrganizer.firstname} {this.state.infoOrganizer.lastname}</Text>
      </Col>
      <Col size={15} style={styleApp.center3} onPress={() => this.alertCoach(this.props.navigation.getParam('data').info.player != true,this.state.infoOrganizer.firstname + ' ' + this.state.infoOrganizer.lastname)}>
        {
          this.props.navigation.getParam('data').info.player == true?
          <View style={[styleApp.roundView,{backgroundColor:colors.secondary}]}>
            <Text style={[styleApp.text,{color:'white',fontSize:10}]}>P</Text>
          </View>
          :
          <View style={[styleApp.roundView,{backgroundColor:colors.green}]}>
            <Text style={[styleApp.text,{color:'white',fontSize:10}]}>C</Text>
          </View>
        }
        
      </Col>
      <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Close',close:true,onGoBack:() => this.props.navigation.navigate('Event'),title:this.state.infoOrganizer.firstname + ' ' + this.state.infoOrganizer.lastname + ' is the organizer of the event.'})}>
        <AllIcons name='bullhorn' color={colors.blue} type='font' size={16}/>
      </Col>
    </Row>
    </TouchableOpacity>
    )
  }
  openCondition() {
    if (Object.values(this.state.usersConfirmed).length <= Number(this.props.navigation.getParam('data').info.maxAttendance)) return true
    return false
  }
  openView() {
    if (this.state.usersConfirmed == true) return <View style={{height:25,width:70}} />
    console.log('this.openCondition()')
    console.log(this.openCondition())
    return <View style={this.openCondition()?styles.viewSport:{...styles.viewSport,backgroundColor:colors.primaryLight}}>
    <Text style={this.openCondition()?styles.textSport:{...styles.textSport,color:'white'}}>{this.openCondition()?'Open':'Full'}</Text>
  </View>
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
  alertCoach(coach,name) {
    console.log(name)
    var text = coach?'coach.':'player.'
    var title = name + ' joined the event as a ' + text
    console.log('title')
    console.log(title)
    this.props.navigation.navigate('Alert',{textButton:'Close',title:title,close:true,onGoBack:() => this.props.navigation.navigate('Event')})
  }
  rowUser(user,i) {
    return (
      <TouchableOpacity key={i} style={[styleApp.cardSelectFlex,{paddingTop:10,paddingBottom:10,flex:1,marginTop:10,minHeight:50}]} activeOpacity={0.7} onPress={() => this.openProfile(user)}>
        <Row>
          <Col size={15} style={styleApp.center}>
            <AllIcons name='user-circle' color={colors.grey} type='font' size={20}/>
          </Col>
          <Col size={50} style={styleApp.center2}>
            <Text style={styleApp.text}>{user.captainInfo.name}</Text>
          </Col>
          <Col size={15} style={styleApp.center3} activeOpacity={0.7} onPress={() => this.alertCoach(user.coach == true,user.captainInfo.name)}>
          {
          user.coach == true?
          <View style={[styleApp.roundView,{backgroundColor:colors.green}]}>
            <Text style={[styleApp.text,{color:'white',fontSize:10}]}>C</Text>
          </View>
          :
          <View style={[styleApp.roundView,{backgroundColor:colors.secondary}]}>
            <Text style={[styleApp.text,{color:'white',fontSize:10}]}>P</Text>
          </View>
        }
          </Col>

          {
          (user.status == 'confirmed' || !this.props.navigation.getParam('data').info.public)?
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Got it!',title:'This user is confirmed for the event.',subtitle:user.captainInfo.name,close:true,onGoBack:() => this.props.navigation.navigate('Event')})}>
            <AllIcons name='check' type='mat' color={colors.green} size={20} />
          </Col>
          :user.status == 'rejected'?
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Got it!',title:'This user has been rejected by the organizer.',subtitle:user.captainInfo.name,close:true,onGoBack:() => this.props.navigation.navigate('Event')})}>
            <AllIcons name='close' type='mat' color={colors.primary} size={20} />
          </Col>
          :
          <Col size={20} style={styleApp.center} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Alert',{textButton:'Got it!',title:"This user is waiting for the organizer's aproval.",subtitle:user.captainInfo.name,close:true,onGoBack:() => this.props.navigation.navigate('Event')})}>
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
  event() {
    var sport = this.props.sports.filter(sport => sport.value == this.props.navigation.getParam('data').info.sport)[0]
    console.log('sport')
    console.log(sport)
    return (
      <View>
        <Row>
          <Col size={80} style={styleApp.center2}>
            <Text style={styleApp.title}>{this.props.navigation.getParam('data').info.name}</Text>
          </Col>
          <Col size={20} style={styleApp.center3}>
          {this.openView()}
          <View style={[styles.viewSport,{marginTop:5}]}>
            <Text style={styles.textSport}>{this.props.navigation.getParam('data').info.sport.charAt(0).toUpperCase() + this.props.navigation.getParam('data').info.sport.slice(1)}</Text>
          </View>
          
          </Col>
        </Row>
        
        {this.rowIcon(this.dateTime(this.props.navigation.getParam('data').date.start,this.props.navigation.getParam('data').date.end),'calendar-alt')}
        {this.rowIcon(this.title(this.props.navigation.getParam('data').location.area),'map-marker-alt')}
        {this.rowIcon(this.title(Number(this.props.navigation.getParam('data').price.joiningFee) == 0?'Free entry':this.props.navigation.getParam('data').price.joiningFee + ' entry fee'),'dollar-sign')}

        <View style={[styleApp.divider,{marginBottom:20}]} />

        <Text style={[styleApp.title,{fontSize:19}]}>Event settings</Text>
        
        {
            Object.values(sport.fields).filter(field => field != null).map((field,i) => (
              <View key={i}>
                {this.rowIcon(this.title(this.getTextField(field,this.props.navigation.getParam('data').advancedSettings)),this.getIconField(field,this.props.navigation.getParam('data').advancedSettings))}
              </View>
        ))}

        <View style={[styleApp.divider,{marginBottom:20}]} />

        <Text style={[styleApp.title,{fontSize:19}]}>Attendees</Text>
        {this.rowOrganizer()}
        

        {
          this.state.usersConfirmed == true?
          <Row style={{marginTop:20}}>
            <Col style={styleApp.center}>
            <Loader size={20} color='green' />
            </Col>
          </Row>
          :this.state.usersConfirmed.length == 0?
          null
          :
          <View style={{marginTop:0}}>
          {Object.values(this.state.usersConfirmed).map((user,i) => (
            this.rowUser(user,i)
          ))}
          </View>
        }

        <View style={[styleApp.divider,{marginBottom:20}]} />

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
          contentScrollView={this.event.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          refreshControl={true}
          refresh={this.loadEvent.bind(this)}
          offsetBottom={sizes.heightFooterBooking+20}
          showsVerticalScrollIndicator={false}
        />
        {
          this.state.usersConfirmed == true?
          null
          :!this.openCondition()?
          null
          :this.props.navigation.getParam('pageFrom') == 'Home'?
          <View style={styleApp.footerBooking}>
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
         </View>
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
