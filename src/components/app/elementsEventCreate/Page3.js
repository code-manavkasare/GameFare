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
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      headerLeft: () => (
        <BackButton name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
  async componentDidMount() {
    console.log('page3 mount')
    console.log(this.props.navigation.getParam('data'))
  }
  dateTime(data) {
    return <DateEvent 
    start={data.step1.startDate}
    end={data.step1.endDate}
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
      <Row style={{marginBottom:10,marginTop:10}}>
        <Col size={15} style={styleApp.center}>
          <AllIcons name={icon} size={18} type={typeIcon} color={colors.grey}/>
        </Col>
        
        <Col size={85} style={[styleApp.center2,{paddingLeft:15}]}>
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
  page2(data) {
    console.log('data')
    console.log(data)
      return (
          <View style={{marginTop:0}}>
            {this.rowIcon('hashtag',this.title(data.step1.name),'font')}
            

            {this.sport(data.sport)}

            {this.rowIcon('calendar-alt',this.dateTime(data),'font')}
            {this.rowIcon('map-marker-alt',this.title(data.step1.location.area),'font')}
            {this.rowIcon('dollar-sign',this.title(Number(data.step1.joiningFee) == 0?'Free':data.step1.joiningFee),'font')}

            <View style={{height:1,marginTop:10,marginBottom:10,backgroundColor:'#eaeaea'}} />

            {
            Object.values(data.sport.fields).filter(field => field != null).map((field,i) => (
              <View key={i}>
                {this.rowIcon(this.getIconField(field,data.step2)[0],this.title(this.getTextField(field,data.step2)),this.getIconField(field,data.step2)[1])}
              </View>
            ))}

            <View style={{height:1,marginTop:10,marginBottom:20,backgroundColor:'#eaeaea'}} />

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
    this.props.navigation.navigate('CreateEvent4',{data:event,pageFrom:'CreateEvent3'})
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1 }}>
        {/* <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Event summary'}
        icon={'angle-left'}
        close={() => this.props.navigation.goBack()}
        /> */}
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.page2(this.props.navigation.getParam('data'))}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={false}
        />
        {
          this.props.userConnected?
          <ButtonRound
          icon={'next'} 
          enabled={true} 
          loader={this.state.loader} 
          translateYFooter={this.translateYFooter}
          translateXFooter={this.translateXFooter} 
          click={() => this.submit(this.props.navigation.getParam('data'))}
         />
         :
         <ButtonRound
          icon={'sign'} 
          enabled={true} 
          loader={false} 
          translateYFooter={this.translateYFooter}
          translateXFooter={this.translateXFooter} 
          click={() => this.props.navigation.navigate('SignIn',{pageFrom:'CreateEvent3'})}
         />
        }
        
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
