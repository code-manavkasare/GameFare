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
import {createEventAction} from '../../../actions/createEventActions'

const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";
import ButtonColor from '../../layout/Views/Button'

import TextField from '../../layout/textField/TextField'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import AllIcons from '../../layout/icons/AllIcons'
import DateEvent from './DateEvent'
import {date} from '../../layout/date/date'
import HeaderBackButton from '../../layout/headers/HeaderBackButton'

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
      recurrence:'',
      loader:false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  componentDidMount() {
    if (Object.values(this.props.step2).length != 0) {
      this.setState(this.props.step2)
    } else {
      this.setState({
        location:{address:'',},
        area:'',       
        startDate:'',
        endDate:'',
        name:'',
        instructions:'',
        recurrence:'',
        loader:false,
      })
    }
  }
  ligneButton(iconLeft,componentMiddle,iconRight,click,conditionCheck) {
    return (
      <ButtonColor view={() => {
        return (
          <Row style={{paddingTop:23,paddingBottom:23}}>       
            <Col size={15} style={[styleApp.center]}>
              <AllIcons name={iconLeft} size={16} color={colors.greyDark} type='font' />
            </Col>
            <Col size={65} style={[styleApp.center2,{paddingLeft:10}]}>
              {componentMiddle}
            </Col>
            <Col size={20} style={styleApp.center}>
              {
                iconRight ==null?null
                :conditionCheck?
                <AllIcons name={'check'} type='font' size={14} color={colors.green} />
                :
                <AllIcons name={iconRight} type='font' size={14} color={colors.title} />
              }
            </Col>
          </Row>
        )
      }} 
      click={() => click()}
      color={'white'}
      style={[{flex:1,borderBottomWidth:1,borderColor:colors.off}]}
      onPressColor={colors.off}
      />
    )
  }
  inputName() {
    return (
      <TextInput
        style={styleApp.input}
        placeholder="Add Event name"
        returnKeyType={'done'}
        ref={(input) => { this.nameInput = input }}
        underlineColorAndroid='rgba(0,0,0,0)'
        autoCorrect={true}
        placeholderTextColor={colors.grey}
        onChangeText={text => this.setState({name:text})}
        value={this.state.name}
      />
    )
  }
  inputInstruction() {
    return (
      <TextInput
        style={styleApp.input}
        placeholder="Parking instruction, unit number...(optional)"
        returnKeyType={'done'}
        ref={(input) => { this.instructionInput = input }}
        underlineColorAndroid='rgba(0,0,0,0)'
        autoCorrect={true}
        multiline={true}
        numberOfLines={6}
        blurOnSubmit={true}
        placeholderTextColor={colors.grey}
        onChangeText={text => this.setState({instructions:text})}
        value={this.state.instructions}
      />
    )
  }
  locationText() {
    return <Text style={this.state.location.address==''?{...styleApp.input,color:colors.grey}:styleApp.input}>{this.state.location.address==''?'Add event address':this.state.location.address}</Text>
  }
  async setLocation(data) {
    await this.setState({location:data})
    this.props.navigation.navigate('CreateEvent2')
  }
  async setDate (data) {
    await this.setState({endDate:data.endDate,startDate:data.startDate,recurrence:data.recurrence})
    this.props.navigation.navigate('CreateEvent2')
  }
  dateTime(start,end) {
    return <DateEvent 
    start={start}
    end={end}
    />
  }
  date() {
    if (this.state.startDate == '') return <Text style={[styleApp.input,{color:colors.grey}]}>Add date and time</Text>
    return this.dateTime(this.state.startDate,this.state.endDate,this.state.recurrence)
  }
  date2() {
    return (
      <TouchableOpacity style={{paddingTop:10,paddingBottom:10}} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Date',{startDate:this.state.startDate,endDate:this.state.endDate,recurrence:this.state.recurrence,onGoBack: (data) => this.setDate(data)})}>
      <Row>
        <Col style={styleApp.center} size={15}>
          <AllIcons name='calendar-alt' size={18} color={colors.title} type='font'/>
        </Col>
        <Col style={[styleApp.center2,{paddingLeft:15}]} size={85}>

        </Col>
      </Row>
      {
        this.state.recurrence != ''?
        <Row style={{marginTop:10}}>
        <Col style={styleApp.center} size={15}>
          <AllIcons name='stopwatch' size={18} color={colors.title} type='font'/>
        </Col>
        <Col style={[styleApp.center2,{paddingLeft:15}]} size={85}>
          <Text style={styleApp.input}>{this.state.recurrence.charAt(0).toUpperCase() + this.state.recurrence.slice(1)}</Text>
        </Col>
      </Row>
      :null
      }
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
        <View style={{marginTop:0,marginLeft:0,width:width,paddingTop:20}}>

              {this.ligneButton('ribbon',this.inputName(),'plus',() => this.nameInput.focus(),this.state.name != '')}
              {this.ligneButton('map-marker-alt',this.locationText(),'plus',() => this.props.navigation.navigate('Location',{location:this.state.location,pageFrom:'CreateEvent2',onGoBack: (data) => this.setLocation(data)}),this.state.location.address != '')}
              {this.ligneButton('calendar-alt',this.date(),'plus',() => this.props.navigation.navigate('Date',{startDate:this.state.startDate,endDate:this.state.endDate,recurrence:this.state.recurrence,onGoBack: (data) => this.setDate(data)}),this.state.startDate != '')}
              {this.ligneButton('parking',this.inputInstruction(),'plus',() => this.instructionInput.focus(),this.state.instructions != '')}
             

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
        'recurrence':step2.recurrence,
        "timeZone": step2.location.timeZone
      },
      "info": {
        "commission": 0,       
        "displayInApp": true,    
        "sport": step0.sportsFilter.valueSelected,
        "public": !step1.private,
        "maxAttendance": step1.players,
        "name": step2.name,
        'levelFilter':step1.levelFilter.valueSelected,
        'levelOption':step1.levelOption.valueSelected,
        'coachNeeded':step0.coachNeeded,
        'player':step0.player,
        'gender':step1.genderFilter.valueSelected,
        'instructions':step2.instructions,
        'league':step0.leagueFilter.valueSelected,
        'rules':step0.rulesFilter.valueSelected,
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
    return this.props.navigation.navigate('CreateEvent3',{data:event,groups:step1.groups})
  }
  async close () {
    console.log('close')
    await this.props.createEventAction('setStep2',this.state)
    return this.props.navigation.navigate(this.props.navigation.goBack())
  }
  async next() {
    await this.props.createEventAction('setStep2',this.state)
    return this.submit()
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1}]}>
         <HeaderBackButton 
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={'Event information'}
            inputRange={[5,10]}
            initialBorderColorIcon={'white'}
            initialBackgroundColor={'white'}

            icon1='arrow-left'
            initialTitleOpacity={1}
            icon2={null}
            clickButton1={() => this.close()} 
            />

        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page1.bind(this)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={false}
        />

        <ButtonRound
          icon={'next'} 
          onPressColor={colors.greenLight}
          enabled={this.conditionOn()} 
          loader={this.state.loader} 
          click={() => this.next()}
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
    step2:state.createEventData.step2,
  };
};

export default connect(mapStateToProps,{createEventAction})(Page2);

