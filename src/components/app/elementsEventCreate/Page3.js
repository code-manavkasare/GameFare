import React,{Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated
} from 'react-native';
import {connect} from 'react-redux';
import {eventsAction} from '../../../actions/eventsActions'

const { height, width } = Dimensions.get('screen')
import Header from '../../layout/headers/HeaderButton'
import ScrollView from '../../layout/scrollViews/ScrollView'
import TextField from '../../layout/textField/TextField'
import Switch from '../../layout/switch/Switch'
import ButtonRound from '../../layout/buttons/ButtonRound'
import Button from '../../layout/buttons/Button'
import ButtonColor from '../../layout/Views/Button'
import DateEvent from './DateEvent'
import firebase from 'react-native-firebase'
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncImage from '../../layout/image/AsyncImage'
import HeaderBackButton from '../../layout/headers/HeaderBackButton'

import AllIcons from '../../layout/icons/AllIcons'
import BackButton from '../../layout/buttons/BackButton'

import styleApp from '../../style/style'
import sizes from '../../style/sizes'
import colors from '../../style/colors';

class Page3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader:true,
      loader:false
    };
    this.translateYFooter = new Animated.Value(0)
    this.translateXFooter = new Animated.Value(0)
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  shouldComponentUpdate(nextProps,nextState) {
    if (this.props.futureEvents != nextProps.futureEvents) return false
    return true
  }
  async componentDidMount() {
    console.log('page3 mount')
    console.log(this.props.navigation.getParam('data'))
  }
  dateTime(data) {
    return <DateEvent 
    start={data.date.start}
    end={data.date.end}
    />
  }
  sport(sport) {
    return <TextField
    state={sport.text}
    placeHolder={''}
    heightField={50}
    multiline={false}
    editable={false}
    keyboardType={'default'}
    icon={sport.icon}
    typeIcon={sport.typeIcon}
  />
  }
  rowIcon(icon,component,typeIcon,img) {
    return (
      <Row style={{paddingTop:6,paddingBottom:6}}>
        <Col size={20} style={styleApp.center}>
          {
            img?
            <AsyncImage style={{width:30,height:30,borderRadius:15}} mainImage={icon} imgInitial={icon} />
            :
            <AllIcons name={icon} size={18} type={typeIcon} color={colors.greyDark}/>
          }
          
        </Col>
        
        <Col size={80} style={styleApp.center2}>
          {component}
        </Col>
      </Row>
    )
  }
  title(text) {
    return <Text style={[styleApp.input]}>{text}</Text>
  }
  getTextField(field,step2) {
    if (field.field == 'expandable') {
      return step2[field.value].listExpend.filter(element => element.value == step2[field.value].valueSelected)[0].text
    } else if (field.field == 'plus') {
      return step2[field.value] + ' ' + field.value
    }
    return step2[field.value]
  }
  getIconField(field,step2) {
    var icon = field.icon
    var typeIcon = field.typeIcon

    if (field.field == 'expandable') {
      icon = step2[field.value].listExpend.filter(element => element.value == step2[field.value].valueSelected)[0].icon
      typeIcon = step2[field.value].listExpend.filter(element => element.value == step2[field.value].valueSelected)[0].typeIcon
    }
    return [icon,typeIcon]
  }
  privateText(data) {
    if (data.step1.private) return 'Private'
    return 'Public • ' + Object.values(data.info.levelFilter.listExpend).filter(element => element.value == data.step1.levelFilter.valueSelected)[0].text + ' ' + Object.values(data.step1.levelOption.listExpend).filter(element => element.value == data.step1.levelOption.valueSelected)[0].text.toLowerCase()
  }
  rowGroup(group,i){
    return (
      <ButtonColor view={() => {
        return (
          <Row>       
            <Col size={15} style={styleApp.center2}>
              <AsyncImage style={{width:'100%',height:40,borderRadius:6}} mainImage={group.pictures[0]} imgInitial={group.pictures[0]} />
            </Col>
            <Col size={85} style={[styleApp.center2,{paddingLeft:15}]}>
              <Text style={styleApp.text}>{group.info.name}</Text>
              <Text style={[styleApp.smallText,{fontSize:12}]}>{group.info.sport.charAt(0).toUpperCase() + group.info.sport.slice(1)}</Text>
            </Col>
            <Col size={10} style={styleApp.center3}>
              <AllIcons name='check' type='mat' size={20} color={colors.green} />
            </Col>
          </Row>
        )
      }} 
      click={() => console.log('')}
      color='white'
      style={[styles.rowGroup,{marginTop:10,flex:1}]}
      onPressColor='white'
      />
    )
  }
  listGroups (groups) {
    if (Object.values(groups).length == 0) return null
    return (
      <View style={styleApp.viewHome}>
              <View style={styleApp.marginView}>
                <Text style={styleApp.text}>Groups</Text>
                <View style={[styleApp.divider2,{marginBottom:10}]} />
                {Object.values(groups).map((group,i) => (
                      this.rowGroup(group,i)
                ))}
              </View>
      </View>
    )
  }
  
  page2(data) {
    console.log('data page 3')
    console.log(data)
      // return null
      var sport = Object.values(this.props.sports).filter(sport => sport.value == data.info.sport)[0]
      var league = Object.values(sport.typeEvent).filter(item => item.value == data.info.league)[0]
      var level = Object.values(sport.level.list).filter(level => level.value == data.info.levelFilter)[0]
      var rule = Object.values(league.rules).filter(rule => rule.value == data.info.rules)[0]
      console.log(sport)
      console.log(level)
      console.log(league)
      console.log(rule)
      var levelOption = data.info.levelOption=='equal'?'only':data.info.levelOption=='min'?'and above':'and below'
      console.log(levelOption)
      return (
          <View style={{width:width,marginLeft:0,marginTop:0}}>

              <View style={styleApp.marginView}>
                <Row>
                  <Col size={25} style={styleApp.center2}>
                    <View style={[styleApp.viewSport,{marginTop:5,backgroundColor:sport.card.color.color}]}>
                      <Text style={[styleApp.textSport,{color:'white'}]}>{data.info.sport.charAt(0).toUpperCase() + data.info.sport.slice(1)}</Text>
                    </View>
                  </Col>
                  <Col size={10} style={styleApp.center3}>
                    <AllIcons name={data.info.public?'lock-open':'lock'} size={18} type={'font'} color={colors.blue}/>
                  </Col>
                  <Col size={65} style={styleApp.center3}>            
                    <Text style={[styleApp.text,{color:colors.primary,marginTop:10,fontFamily:'OpenSans-Bold',fontSize:18}]}>{Number(data.price.joiningFee)==0?'Free entry':'$'+data.price.joiningFee}</Text>  
                  </Col>
                </Row>
              </View>

            <View style={[{paddingTop:15}]}>
              <View style={styleApp.marginView}>
                <Text style={[styleApp.title,{fontSize:20}]}>{data.info.name}</Text>
                <View style={[styleApp.divider2,{marginBottom:10}]} />

                {this.rowIcon('calendar-alt',this.dateTime(data),'font')}
                {data.date.recurrence != ''?this.rowIcon('stopwatch',this.title(data.date.recurrence.charAt(0).toUpperCase() + data.date.recurrence.slice(1)),'font'):null}
                {this.rowIcon('map-marker-alt',this.title(data.location.area),'font')}
                <View style={{height:5}}/>
                {data.info.instructions != ''?this.rowIcon('parking',this.title(data.info.instructions),'font'):null}
              </View>
            </View>


            {/* <View style={[styleApp.divider2,{marginLeft:20,width:width-40,marginBottom:10}]} /> */}

            

              <View style={[styleApp.marginView,{marginTop:25}]}>
              {this.rowIcon('user-plus',this.title(Number(data.info.maxAttendance)==1?data.info.maxAttendance + ' player':data.info.maxAttendance + ' players'),'font')}
              <View style={{height:5}}/>
              {this.rowIcon('balance-scale',this.title(level.value=='0'?level.text:level.text + ' ' + levelOption),'font')}
              <View style={{height:5}}/>

              {this.rowIcon(data.info.gender == 'mixed'?'venus-mars':data.info.gender == 'female'?'venus':'mars',this.title(data.info.gender.charAt(0).toUpperCase() + data.info.gender.slice(1)),'font')}
              

              <View style={{height:0,marginTop:20,marginBottom:10,backgroundColor:colors.borderColor}} />
              
              {this.rowIcon('puzzle-piece',this.title(rule.text),'font')}
              {this.rowIcon(league.icon,this.title(league.text),'font',true)}
              </View>

              <View style={[styleApp.divider2,{marginLeft:20,width:width-40}]} />

            {this.listGroups(this.props.navigation.getParam('groups'))}

              <View style={styleApp.marginView}>
                {
                  data.info.player?
                  <Text style={[styleApp.title,{fontSize:13}]}>Reminder • <Text style={{fontFamily:'OpenSans-Regular'}}>As a host you will get to play for free!</Text></Text>
                  :
                  <Text style={[styleApp.title,{fontSize:13}]}>Reminder • <Text style={{fontFamily:'OpenSans-Regular'}}>Players will be charged when they register for the event. You’ll get paid once the session is over.</Text></Text>
                }
              </View>



            
            

          </View>
      )
  }
  async submit(data) {
    this.setState({loader:true})

    var event = {
      ...this.props.navigation.getParam('data'),
      info:{
        ...this.props.navigation.getParam('data').info,
        organizer:this.props.userID,
      }
    }
    var attendees = {}
    var coaches = {}
    var user = {
      captainInfo:{
        name:this.props.infoUser.firstname  + ' ' + this.props.infoUser.lastname,
        level:this.props.level == undefined?'':this.props.level[data.info.sport] == undefined?'':this.props.level[data.info.sport],
        picture:this.props.infoUser.picture == undefined?'':this.props.infoUser.picture,
        userID:this.props.userID,
        phoneNumber:this.props.infoUser.countryCode + this.props.infoUser.phoneNumber,
      },
      status:'confirmed',
      userID:this.props.userID,
    }
    if (event.info.player) {
      user.coach = false
      attendees = {
        [this.props.userID]:user
      }
    } else {
      user.coach = true
      coaches = {
        [this.props.userID]:user
      }
    }
    var groupsToPush = []
    var groups = this.props.navigation.getParam('groups')
    if (Object.values(groups).length != 0) {
      var groupsToPush = Object.values(groups).map((group) => {
        return group.objectID
      })
    }
    var allAttendees = Object.values(attendees).map((user) => {
      return user.userID
    })
    var allCoaches = Object.values(coaches).map((user) => {
      return user.userID
    })
    event={
      ...event,
      date_timestamp:Number(new Date(event.date.start)),
      coaches:coaches,
      allCoaches:allCoaches,
      attendees:attendees,
      allAttendees:allAttendees,
      groups:groupsToPush
    }
    
    console.log('event')
    console.log(event)
    var pushEvent = await firebase.database().ref('events').push(event)
    event.eventID = pushEvent.key
    event.objectID = pushEvent.key

    await firebase.database().ref('events/' + pushEvent.key).update({'eventID':pushEvent.key})
    // await firebase.database().ref('usersEvents/' + this.props.userID + '/' + pushEvent.key).update(userEvent)
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      await firebase.messaging().subscribeToTopic(this.props.userID)
      await firebase.messaging().subscribeToTopic('all')
      await firebase.messaging().subscribeToTopic(pushEvent.key)
    } catch (error) {
        // User has rejected permissions
    }
    for (var i in groupsToPush) {
      await firebase.database().ref('groups/' + groupsToPush[i] + '/events').update({[pushEvent.key]:{
        eventID:pushEvent.key
      }})
    }
    var futureEvents = this.props.futureEvents.slice(0).reverse()
    futureEvents.push(event)
    futureEvents = futureEvents.reverse()
    await  this.props.eventsAction('setFutureUserEvents',futureEvents)
    console.log('groupsToPush')
    console.log(groupsToPush)
    this.setState({loader:false})
    
    this.props.navigation.navigate('Contacts',{data:event,pageFrom:'CreateEvent3',openPageLink:'openEventPage'})
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1}]}>
         <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={''}
        inputRange={[5,10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1='arrow-left'
        icon2={null}
        clickButton1={() => this.props.navigation.goBack()} 
        />

        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.page2(this.props.navigation.getParam('data'))}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={false}
        />


        <View style={styleApp.footerBooking}>
        {
          this.props.userConnected?
          <Button
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenLight}
          styleButton={{marginLeft:20,width:width-40}}
          enabled={true} 
          disabled={false}
          text={'Create event'}
          loader={this.state.loader} 
          click={() => this.submit(this.props.navigation.getParam('data'))}
         />
         :
         <Button
          backgroundColor='green'
          onPressColor={colors.greenLight}
          styleButton={{marginLeft:20,width:width-40}}
          enabled={true} 
          text='Sign in to proceed'
          loader={false} 
          click={() => this.props.navigation.navigate('SignIn',{pageFrom:'CreateEvent3'})}
         />
        }
         </View>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({

  });


  const  mapStateToProps = state => {
    return {
      sports:state.globaleVariables.sports.list,
      userConnected:state.user.userConnected,
      userID:state.user.userID,
      infoUser:state.user.infoUser.userInfo,
      level:state.user.infoUser.level,

      futureEvents:state.events.futureUserEvents,
    };
  };
  
  export default connect(mapStateToProps,{eventsAction})(Page3);
