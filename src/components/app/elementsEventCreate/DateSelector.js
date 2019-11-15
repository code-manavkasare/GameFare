import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  PermissionsAndroid,
  Dimensions,
  View
} from 'react-native';

import FontIcon from 'react-native-vector-icons/FontAwesome';
import { Col, Row, Grid } from "react-native-easy-grid";
import moment from 'moment'
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import BackButton from '../../layout/buttons/BackButton'

import ScrollView from '../../layout/scrollViews/ScrollView'
import Header from '../../layout/headers/HeaderButton'
import Switch from '../../layout/switch/Switch'
import Picker from '../../layout/pickers/Picker'

import Button from '../../layout/buttons/Button';
import {date} from '../../layout/date/date'

const { height, width } = Dimensions.get('screen')

export default class Date extends Component {
    constructor(props) {
        super(props);
        this.state = {
          
        };
        this.componentWillMount = this.componentWillMount.bind(this);
      }
      static navigationOptions = ({ navigation }) => {
        return {
          title: 'Date & Time',
          headerStyle:styleApp.styleHeader,
          headerTitleStyle: styleApp.textHeader,
          headerLeft: () => (
            <BackButton color={colors.title} name='keyboard-arrow-down' type='mat' click={() => navigation.navigate('CreateEvent2')} />
          ),
        }
      };
    componentWillMount(){
      this.setState({startTimeHour:this.props.navigation.getParam('startDate') == ''?'1':moment(this.props.navigation.getParam('startDate')).format('h'),
      startTimeMin:this.props.navigation.getParam('startDate') == ''?'00':moment(this.props.navigation.getParam('startDate')).format('mm'),
      endTimeHour:this.props.navigation.getParam('endDate') == ''?'1':moment(this.props.navigation.getParam('endDate')).format('h'),
      endTimeMin:this.props.navigation.getParam('endDate') == ''?'00':moment(this.props.navigation.getParam('endDate')).format('mm'),
      startPart:this.props.navigation.getParam('startDate') == ''?false:moment(this.props.navigation.getParam('startDate')).format('a') == 'am'?false:true,
      endPart:this.props.navigation.getParam('endDate') == ''?false:moment(this.props.navigation.getParam('endDate')).format('a') == 'am'?false:true,
      sameDay:this.props.navigation.getParam('startDate') == ''?true:moment(this.props.navigation.getParam('endDate')).format('YYYY-MM-DD') == moment(this.props.navigation.getParam('startDate')).format('YYYY-MM-DD')?true:false,
      daySelectedStart: this.props.navigation.getParam('startDate') == ''?moment().format('YYYY-MM-DD'):moment(this.props.navigation.getParam('endDate')).format('YYYY-MM-DD'),
      markedDatesStart:{
        [this.props.navigation.getParam('startDate') == ''?moment().format('YYYY-MM-DD'):moment(this.props.navigation.getParam('endDate')).format('YYYY-MM-DD')]: {selected: true,selectedColor: colors.primary}
      },
      daySelectedEnd: this.props.navigation.getParam('endDate') == ''?moment().format('YYYY-MM-DD'):moment(this.props.navigation.getParam('endDate')).format('YYYY-MM-DD'),
      markedDatesEnd:{
        [this.props.navigation.getParam('endDate') == ''?moment().format('YYYY-MM-DD'):moment(this.props.navigation.getParam('endDate')).format('YYYY-MM-DD')]: {selected: true,selectedColor: colors.primary}
      },
      hourPicker:['1','2','3','4','5','6','7','8','9','10','11','12'],
      minutePicker:['00','05','10','15','20','25','30','35','40','45','50','55'],})
    }
    selectDay(day,date,markedDates) {
      console.log(day)
      this.setState({
        [markedDates]:{
          [day.dateString]: {selected: true,selectedColor: colors.primary}
        },
        [date]:day.dateString
      })
    }
    calendar (date,markedDates) {
      return (
        <Calendar
                minDate={new Date()}
                markedDates={this.state[markedDates]}
  
                // Handler which gets executed on day press. Default = undefined
                onDayPress={(day) => this.selectDay(day,date,markedDates)}
  
                // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                monthFormat={'MMMM'}
                // Handler which gets executed when visible month changes in calendar. Default = undefined
                onMonthChange={(month) => {console.log('month changed', month)}}
                // Hide month navigation arrows. Default = false
                hideArrows={false}
                // Replace default arrows with custom ones (direction can be 'left' or 'right')
                hideExtraDays={true}
                // day from another month that is visible in calendar page. Default = false
                disableMonthChange={false}
                // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                firstDay={1}
                // Hide day names. Default = false
                hideDayNames={false}
                // Show week numbers to the left. Default = false
                showWeekNumbers={false}
                // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                //onPressArrowLeft={substractMonth => substractMonth()}
                // Handler which gets executed when press arrow icon left. It receive a callback can go next month
                //onPressArrowRight={addMonth => addMonth()}
                style={{height:340}}
                theme={{
                  base: { width: 20, height: 10, justifyContent: 'center' },
                  textMonthFontWeight:'bold',
                  textDayFontSize: 14,
                  textMonthFontSize: 14,
                  todayTextColor: colors.primary,
                  arrowColor: colors.title,
                  textDayHeaderFontSize: 14,
                  week: {
                    marginTop: 0,
                    height:10,
                    flexDirection: 'row',
                    justifyContent: 'space-around'
                  },
                  textDayFontFamily:'OpenSans-Regular',
                  textMonthFontFamily:'OpenSans-Regular',
                  textDayHeaderFontFamily:'OpenSans-Regular',
                  textTodayFontFamily:'OpenSans-Regular',
                }}
              />
      )
    }
    switch (textOn,textOff,state,translateXComponent0,translateXComponent1) {
      return (
        <Switch 
          textOn={textOn}
          textOff={textOff}
          translateXTo={0.3*(width-40)}
          height={50}
          translateXComponent0={translateXComponent0}
          translateXComponent1={translateXComponent1}
          state={this.state[state]}
          setState={(val) => this.setState({[state]:val})}
        />
      )
    }
    timeSelect (hour,min,part) {
      return (
        <Row style={{marginBottom:20,height:100}}>
          <Col size={40} style={styles.center2}>
            <Row style={[{height:100}]}>
              <Col size={45} style={[styles.center2,{paddingTop:8}]}>
                <Picker 
                  choices={this.state.hourPicker}
                  choice={this.state[hour]}
                  setChoice={(choice) => this.setState({[hour]:choice})}
                />
              </Col>
              <Col size={10} style={styles.center}>
                <Text style={styles.text}>:</Text>
              </Col>
              <Col size={45} style={[styles.center2,{paddingTop:8}]}>
                <Picker 
                  choices={this.state.minutePicker}
                  choice={this.state[min]}
                  setChoice={(choice) => this.setState({[min]:choice})}
                />
              </Col>
            </Row>
          </Col>
          <Col size={3}></Col>
          <Col style={styles.center2} size={57}>
            {this.switch('am','pm',part)}
          </Col>
        </Row>
      )
    }
    styleTickFree(free) {
      if (free) return styles.tickBox
      return styles.tickBoxOff
    }
    sameDay () {
      return (
        <TouchableOpacity style={{height:40}} activeOpacity={0.7} onPress={() => this.setState({sameDay:!this.state.sameDay})}>
          <Row>
          <Col style={styles.center2} size={15}>
              <View style={this.styleTickFree(this.state.sameDay)}>
                {
                this.state.sameDay?
                <FontIcon name="check" color="white" size={15} />
                :
                <FontIcon name="check" color="#eaeaea" size={15} />
                }
              </View>
              
            </Col>
            <Col style={styles.center2} size={85}>
              <Text style={styles.text}>{date(this.state.daySelectedStart,'ddd, Do MMM')}</Text>
            </Col>
          </Row>
        </TouchableOpacity>
      )
    }
    headerText(text) {
      return (
        <Row style={{height:45,borderBottomWidth:1,borderTopWidth:1,borderColor:'#eaeaea',marginBottom:10}}>
          <Col style={styles.center}>
            <Text style={[styleApp.title,{fontSize:20}]}>{text}</Text>
          </Col>
        </Row>
      )
    }
    dateFields () {
      return (
        <View style={{marginLeft:-20,width:width}}>
          <View style={[styleApp.viewHome,{paddingTop:5}]}>
            <View style={styleApp.marginView}>
              
              {this.calendar('daySelectedStart','markedDatesStart')}
              <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>Start time</Text>
              <View style={styleApp.divider2}/>
              {this.timeSelect('startTimeHour','startTimeMin','startPart')}
              <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>End time</Text>
              <View style={styleApp.divider2}/>
              {this.timeSelect('endTimeHour','endTimeMin','endPart')}
            </View>
          </View>

          {/* <View style={[styleApp.viewHome,{paddingTop:5}]}>
            <View style={styleApp.marginView}>
              <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>End</Text>
              <View style={styleApp.divider2}/>
              {this.sameDay()}

              {
                !this.state.sameDay?
                this.calendar('daySelectedEnd','markedDatesEnd')
                :null
              }

              <View style={{height:10}}/>
              
            </View>
          </View> */}

        </View>
      )
    }
    async close() {
      await Keyboard.dismiss()
      this.props.close()
    }
    async submit() {
      var startPart = this.state.startPart?'pm':'am'
      var endPart = this.state.endPart?'pm':'am'
      var startDate = moment(this.state.daySelectedStart + ' ' + this.state.startTimeHour + ':' + this.state.startTimeMin + ' ' + startPart,'YYYY-MM-DD h:mm a').toString()
      startDate = startDate.split(' GMT')[0]
      var endDate = moment(this.state.daySelectedEnd + ' ' + this.state.endTimeHour + ':' + this.state.endTimeMin + ' ' + endPart,'YYYY-MM-DD h:mm a').toString()
      if (this.state.sameDay) {
        endDate = moment(this.state.daySelectedStart + ' ' + this.state.endTimeHour + ':' + this.state.endTimeMin + ' ' + endPart,'YYYY-MM-DD h:mm a').toString()
      }
      endDate = endDate.split(' GMT')[0]
      console.log('startDate')
      console.log(startDate)
      console.log(endDate)
      this.props.navigation.state.params.onGoBack({
        startDate:startDate,
        endDate:endDate,
      })
    }
    header() {
      return <Header 
      icon={'angle-down'}
      borderColor={'white'}
      title={'Date & Time'}
      loader={this.state.loader}
      close={() => this.props.navigation.goBack()}
      onRef={ref => (this.headerRef = ref)}
    />
    }
  render() {
    console.log('render location')
    return (
      <View style={styles.content}>
          {/* {this.header()} */}

        <ScrollView 
          style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.dateFields.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={sizes.heightFooterBooking+70}
          showsVerticalScrollIndicator={false}
        />

        <View style={styleApp.footerBooking}>
          <View style={{marginLeft:20,width:width-40}}>
            <Button backgroundColor={'green'} onPressColor={colors.greenClick} text={'Submit'} click={() => this.submit()} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content:{
    // backgroundColor:colors.off2,
    // position:'absolute',
    top:0,
    flex:1,
    borderTopWidth:0,
    borderColor:colors.off,
    width:width,
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    //alignItems: 'center',
    justifyContent: 'center',
  },
  tickBox:{
    alignItems: 'center',
    justifyContent: 'center',
    height:20,
    width:20,
    borderRadius:2,
    backgroundColor:colors.primary,
    borderColor:colors.primary,
    borderWidth:1,
  },
  tickBoxOff:{
    alignItems: 'center',
    justifyContent: 'center',
    height:20,
    width:20,
    borderRadius:2,
    backgroundColor:'white',
    borderColor:'#eaeaea',
    borderWidth:1,
  },
  title:{
    color:colors.title,
    fontSize:19,
    fontFamily: 'OpenSans-SemiBold',
  },
  subtitle:{
    color:colors.title,
    fontSize:15,
    fontFamily: 'OpenSans-Regular',
  },
  text:{
    color:colors.title,
    fontSize:15,
    fontFamily: 'OpenSans-Regular',
  },
  input:{
    color:colors.title,
    fontSize:15,
    fontFamily: 'OpenSans-Regular',
    paddingHorizontal:10,
  },
  popupNoProviders:{
    top:0,
    height:height,
    width:'100%',
    marginLeft:0,
  },
});

