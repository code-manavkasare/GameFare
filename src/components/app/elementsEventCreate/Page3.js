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

const { height, width } = Dimensions.get('screen')
import Header from '../../layout/headers/HeaderButton'
import ScrollView from '../../layout/scrollViews/ScrollView'
import TextField from '../../layout/textField/TextField'
import Switch from '../../layout/switch/Switch'
import ButtonRound from '../../layout/buttons/ButtonRound'
import Button from '../../layout/buttons/Button'
import DateEvent from './DateEvent'
import firebase from 'react-native-firebase'
import { Col, Row, Grid } from "react-native-easy-grid";

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
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Event summary',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
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
  rowIcon(icon,component,typeIcon) {
    return (
      <Row style={{marginBottom:0,marginTop:10}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name={icon} size={18} type={typeIcon} color={colors.grey}/>
        </Col>
        
        <Col size={80} style={styleApp.center2}>
          {component}
        </Col>
      </Row>
    )
  }
  title(text) {
    return <Text style={[styleApp.title,{fontSize:15,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
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
  page2(data) {
    console.log('data')
    console.log(data)
      return (
          <View style={{marginTop:0}}>
            <Row style={{marginBottom:10}}>
              <Col size={80} style={styleApp.center2}>
                <Text style={[styleApp.title,{fontSize:20}]}>{data.info.name}</Text>
              </Col>
              <Col size={20} style={styleApp.center3}>
                <View style={styleApp.viewSport}>
                  <Text style={styleApp.textSport}>{data.info.sport}</Text>
                </View>
              </Col>
            </Row>
            {this.rowIcon('calendar-alt',this.dateTime(data),'font')}
            {this.rowIcon('map-marker-alt',this.title(data.location.area),'font')}

            {/* {this.sport(data.info.sport)} */}

            <View style={{height:10}} />

            {/* {this.rowIcon('key',this.title(this.privateText(data)),'font')} */}
            <View style={{height:0.3,marginTop:10,marginBottom:10,backgroundColor:colors.borderColor}} />

            
            {this.rowIcon('dollar-sign',this.title(Number(data.info.joiningFee) == 0?'Free':data.info.joiningFee),'font')}

            <View style={{height:0.3,marginTop:10,marginBottom:10,backgroundColor:colors.borderColor}} />

            

            {/* {
            Object.values(data.sport.fields).filter(field => field != null).map((field,i) => (
              <View key={i}>
                {this.rowIcon(this.getIconField(field,data.step2)[0],this.title(this.getTextField(field,data.step2)),this.getIconField(field,data.step2)[1])}
              </View>
            ))} */}

          <View style={{height:0.3,marginTop:10,marginBottom:20,backgroundColor:colors.borderColor}} />

            <Text style={[styleApp.title,{fontSize:13}]}>Reminder • <Text style={{fontFamily:'OpenSans-Regular'}}>Players will be charged when they register for the event. You’ll get paid once the session is over.</Text></Text>


          </View>
      )
  }
  async submit(data) {
    this.setState({loader:true})
    var advancedSettings = {}
    var fields = Object.values(data.sport.fields).filter(field => field!= null)
    for (var i in fields) {
      var value = ''
      if (fields[i].field == 'expandable') {
        value = data.step2[fields[i].value].valueSelected
      } else {
        value = data.step2[fields[i].value]
      }
      advancedSettings= {
        ...advancedSettings,
        [fields[i].value]:value
      }
    }
    var event = {
      "date": {
        "end": data.step1.endDate,
        "start": data.step1.startDate,
        "timeZone": data.step1.location.timeZone
      },
      "info": {
        "commission": 0,       
        "displayInApp": true,    
        "sport": data.sport.value,
        "public": !data.step1.private,
        "maxAttendance": advancedSettings.players,
        "name": data.step1.name,
        "organizer": this.props.userID,
        "reward": 0.5,
        'levelFilter':data.step1.levelFilter.valueSelected,
        'levelOption':data.step1.levelOption.valueSelected,
        'coachNeeded':data.step0.coachNeeded,
        'player':data.step0.player
      },
      "advancedSettings":advancedSettings,
      "location": {
        "address": data.step1.location.address,
        "area": data.step1.location.area,
        "centralLocation": !data.step1.randomLocation,
        "lat": data.step1.location.lat,
        "lng": data.step1.location.lng
      },
      "price": {
        "joiningFee": Number(data.step1.joiningFee),
        "prizeMoney": "50"
      },
      "subscribtionOpen": true,
    }
    console.log('event')
    console.log(event)
    var pushEvent = await firebase.database().ref('events').push(event)
    event.eventID = pushEvent.key
    await firebase.database().ref('events/' + pushEvent.key).update({'eventID':pushEvent.key})
    await firebase.database().ref('usersEvents/' + this.props.userID + '/' + pushEvent.key).update(event)
    this.setState({loader:false})
    this.props.navigation.navigate('Contacts',{data:event,pageFrom:'CreateEvent3'})
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1}]}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.page2(this.props.navigation.getParam('data'))}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={false}
        />


        <View style={styleApp.footerBooking}>
        {
          this.props.userConnected?
          <Button
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
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
          onPressColor={colors.greenClick}
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
    };
  };
  
  export default connect(mapStateToProps,{})(Page3);
