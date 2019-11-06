import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import StatusBar from '@react-native-community/status-bar';
import BackButton from '../../layout/buttons/BackButton'

import Header from '../../layout/headers/HeaderButton'
import TextField from '../../layout/textField/TextField'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import Switch from '../../layout/switch/Switch'
import AllIcons from '../../layout/icons/AllIcons'
import DateEvent from './DateEvent'
import {date} from '../../layout/date/date'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

class Page2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location:{address:'',},
      area:'',       
      startDate:'',
      endDate:'',
      name:'',
      instructions:'',
      loader:false,
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Event information',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
  componentDidMount() {
    console.log('page 1 mount')
    console.log(this.props.sports)
    console.log(this.state.sportsFilter)
  }
  close() {
      this.props.navigation.goBack()
  }
  switch (textOn,textOff,state,translateXComponent0,translateXComponent1) {
    return (
      <Switch 
        textOn={textOn}
        textOff={textOff}
        translateXTo={width/2-20}
        height={50}
        translateXComponent0={translateXComponent0}
        translateXComponent1={translateXComponent1}
        state={this.state[state]}
        setState={(val) => this.setState({[state]:val})}
      />
    )
  }

  tournamentName () {
    return(
      <TouchableOpacity activeOpacity={0.7} onPress={() => this.nameInput.focus()} style={styleApp.inputForm}>
      <Row >
        <Col size={15} style={styleApp.center}>
          <AllIcons name='hashtag' size={16} color={colors.title} type='font' />
        </Col>
        <Col style={[styleApp.center2,{paddingLeft:15}]} size={90}>
          <TextInput
            style={styleApp.input}
            placeholder="Event name"
            returnKeyType={'done'}
            ref={(input) => { this.nameInput = input }}
            underlineColorAndroid='rgba(0,0,0,0)'
            autoCorrect={true}
            onChangeText={text => this.setState({name:text})}
            value={this.state.name}
          />
        </Col>
      </Row>
      </TouchableOpacity>
    )
  }
  address() {
    return (
      <TouchableOpacity style={styleApp.inputForm} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Location',{location:this.state.location,onGoBack: (data) => this.setLocation(data)})}>
        <Row>
          <Col style={styleApp.center} size={15}>
            <AllIcons name='map-marker-alt' size={18} color={colors.title} type='font'/>
          </Col>
          <Col style={[styleApp.center2,{paddingLeft:15}]} size={85}>
            <Text style={this.state.location.address == ''?styleApp.inputOff:styleApp.input}>{this.state.location.address==''?'Event address':this.state.location.address}</Text>
          </Col>
        </Row>
      </TouchableOpacity>
    )
  }
  async setLocation(data) {
    await this.setState({location:data})
    this.props.navigation.navigate('CreateEvent2')
  }
  async setDate (data) {
    await this.setState({endDate:data.endDate,startDate:data.startDate})
    this.props.navigation.navigate('CreateEvent2')
  }
  dateTime(start,end) {
    return <DateEvent 
    start={start}
    end={end}
    />
  }
  heightDateTimeCard() {
    if (this.state.startDate == '') return 50
    else if (date(this.state.startDate,'ddd, MMM D') == date(this.state.endDate,'ddd, MMM D')) return 65
    return 100
  }
  date() {
    return (
      <TouchableOpacity style={[styleApp.inputForm,{height:this.heightDateTimeCard()}]} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Date',{startDate:this.state.startDate,endDate:this.state.endDate,onGoBack: (data) => this.setDate(data)})}>
      <Row>
        <Col style={styleApp.center} size={15}>
          <AllIcons name='calendar-alt' size={18} color={colors.title} type='font'/>
        </Col>
        <Col style={[styleApp.center2,{paddingLeft:15}]} size={85}>
          {
            this.state.startDate == ''?
            <Text style={styleApp.inputOff}>Date and time</Text>
            :
            this.dateTime(this.state.startDate,this.state.endDate)
          }
        </Col>
      </Row>
    </TouchableOpacity>
    )
  }
  textField (state,placeHolder,heightField,multiline,keyboardType,icon) {
    return(
      <TextField
      state={this.state[state]}
      placeHolder={placeHolder}
      heightField={heightField}
      multiline={multiline}
      setState={(val) => this.setState({[state]:val})}
      keyboardType={keyboardType}
      icon={icon}
      typeIcon={'font'}
      />
    )
  }
  page1() {
      return (
        <View style={{marginTop:-15}}>
          

          <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>Name</Text>
          {this.tournamentName()}

          <Text style={[styleApp.title,{fontSize:19,marginTop:30}]}>Information</Text>
          {this.address()}
          {this.date()}
          
          <Text style={[styleApp.title,{fontSize:19,marginTop:30}]}>Instructions</Text>
          
          {this.textField('instructions','E.g parking instruction, unit number...(optional)',100,true,'default','parking')}
         

        </View>
      )
  }
  conditionOn () {
    if (this.state.location.address == '' || this.state.startDate == '' || this.state.name=='') return false
    return true
  }
  async submit() {
    await this.setState({loader:true})
    console.log('submit page 2')
    console.log(this.props.navigation.getParam('page0'))
    console.log(this.props.navigation.getParam('page1'))
    console.log(this.state)
    var step0 = this.props.navigation.getParam('page0')
    var step1 = this.props.navigation.getParam('page1')
    var step2 = this.state
    console.log(this.state)
    var event = {
      "date": {
        "end": step2.endDate,
        "start": step2.startDate,
        "timeZone": step2.location.timeZone
      },
      "info": {
        "commission": 0,       
        "displayInApp": true,    
        "sport": step0.sportsFilter.valueSelected,
        "public": !step0.private,
        "maxAttendance": step1.players,
        "name": step2.name,
        'levelFilter':step1.levelFilter.valueSelected,
        'levelOption':step1.levelOption.valueSelected,
        'coachNeeded':step0.coachNeeded,
        'player':step0.player,
        'gender':step1.genderFilter.valueSelected,
        'instructions':step2.instructions
      },
      // "advancedSettings":advancedSettings,
      "location": {
        "address": step2.location.address,
        "area": step2.location.area,
        "centralLocation": !step2.randomLocation,
        "lat": step2.location.lat,
        "lng": step2.location.lng
      },
      "price": {
        "joiningFee": Number(step0.joiningFee),
      },
      "subscribtionOpen": true,
    }
    console.log('event')
    console.log(event)
    await this.setState({loader:false})
    return this.props.navigation.navigate('CreateEvent3',{data:event})
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1}]}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page1.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={true}
        />

        <ButtonRound
          icon={'next'} 
          enabled={this.conditionOn()} 
          loader={this.state.loader} 
          click={() => this.submit()}
         />

      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
  };
};

export default connect(mapStateToProps,{})(Page2);

