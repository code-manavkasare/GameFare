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
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import Switch from '../../layout/switch/Switch'
import AllIcons from '../../layout/icons/AllIcons'
import DateEvent from './DateEvent'
import {date} from '../../layout/date/date'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

class Page1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      private:false,
      joiningFee:'',
      free:false,
      randomLocation:false,
      location:{address:'',},
      area:'',       
      startDate:'',
      endDate:'',
      rules:'',
      name:'',
      sportsFilter:{
        text:"Sports",
        value:'sports',
        type:'sports',
        expendable:true,
        alwaysExpanded:true,
        value:Object.values(this.props.sports)[0],
        valueSelected:Object.values(this.props.sports)[0].value,
        listExpend:Object.values(this.props.sports)
      },
      joiningFilter:{
        text:"Joining",
        value:'join',
        type:'join',
        expendable:true,
        alwaysExpanded:true,
        value:Object.values(this.props.sports[0].level.filter)[0],
        valueSelected:Object.values(this.props.sports[0].level.filter)[0].value,
        listExpend:Object.values(this.props.sports[0].level.filter)
      },
      showDate:false
    };
    this.translateYFooter = new Animated.Value(0)
    this.translateXFooter = new Animated.Value(0)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Organize your event',
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
        <BackButton name='keyboard-arrow-left' type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  componentDidMount() {
    console.log('page 1 mount')
    console.log(this.props.sports)
    console.log(this.state.sportsFilter)
  }
  close() {
      // StatusBar.setBarStyle('light-content',true)
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
  sports() {
    return (
      <ExpandableCard 
            option = {this.state.sportsFilter} 
            tickFilter={(value) => {
            var sportsFilter = this.state.sportsFilter
            sportsFilter.value = Object.values(this.props.sports).filter(sport => sport.value == value)[0]
            sportsFilter.valueSelected = value
            this.setState({sportsFilter:sportsFilter})
        }}
      />
    )
  }
  filter() {
    return (
      <ExpandableCard 
            option = {this.state.joiningFilter} 
            tickFilter={(value) => {
            var joiningFilter = this.state.joiningFilter
            joiningFilter.value = Object.values(this.props.sports.level.filter).filter(filter => filter.value == value)[0]
            joiningFilter.valueSelected = value
            this.setState({joiningFilter:joiningFilter})
        }}
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
  styleCondition(condition,basicStyle,addStyle1,addStyle0) {
    if (condition) return {...basicStyle,...addStyle1}
    return {...basicStyle,...addStyle0}
  }
  styleTickFreeInput(free) {
    if (free) return {
      ...styleApp.input,
      color:colors.title,
      // fontFamily:Fonts.MarkOTMedium,
    }
    return {...styles.text,color:'#C7C7CC'}
  }
  styleTickFree(free) {
    if (free) return styles.tickBox
    return styles.tickBoxOff
  }
  styleTickFreeText(free,color) {
    if (free) return {
      ...styleApp.input,
      color:color,
      fontFamily:'OpenSans-SemiBold',
      // textDecorationLine: 'underline',

    }
    return {...styles.text,color:'#eaeaea'}
  }
  entreeFeeSection(state){
    return(
      <Row style={{height:55}}>
        <Col size={60} style={styleApp.center2}>
          <TouchableOpacity activeOpacity={0.7}  onPress={() => this.entreeFeeInputRef.focus()} style={this.styleCondition(this.state[state],styleApp.inputForm,{borderColor:'#eaeaea'},{backgroundColor:'white',borderColor:'#eaeaea'})}>
            <Row>
              <Col style={styleApp.center} size={25}>
                <AllIcons name='dollar-sign' size={18} color={colors.title} type='font'/>
              </Col>
              <Col style={[styleApp.center2,{paddingLeft:15}]} size={75}>
                <TextInput
                  style={this.styleTickFreeInput(!this.state.free)}
                  placeholder="Entry fee"
                  returnKeyType={'done'}
                  //editable={!this.state.free}
                  keyboardType={'phone-pad'}
                  ref={(input) => { this.entreeFeeInputRef = input }}
                  underlineColorAndroid='rgba(0,0,0,0)'
                  autoCorrect={true}
                  onChangeText={text => {
                    if (text.length == 0 && this.state.joiningFee.length != 0) {
                      this.setState({joiningFee:text,free:true})
                    }
                    else if (Number(text) == 0 ) {
                      this.setState({joiningFee:text,free:true})
                    } else {
                      if (Number(text).toString() == 'NaN'){
                        return this.setState({free:false,joiningFee:text.replace(text[text.length-1],'')})
                      }
                      return this.setState({joiningFee:text,free:false})
                    }
                    
                  }}
                  value={this.state.joiningFee}
                />
              </Col>
            </Row>
          </TouchableOpacity>
        </Col>
        <Col size={40} style={styleApp.center3} activeOpacity={0.7} onPress={() => {
          if (!this.state.free) {
            this.entreeFeeInputRef.blur()
          }
          this.setState({free:!this.state.free,joiningFee:!this.state.free?'0':''})
        }}>
          <Row style={[styleApp.cardSelect,{borderWidth:0,shadowOpacity:0}]}>
            <Col style={styleApp.center} >
              
              <View style={this.styleTickFree(this.state.free)}>
                {
                this.state.free?
                <FontIcon name="check" color={colors.primary} size={15} />
                :
                <FontIcon name="check" color="#eaeaea" size={15} />
                }
              </View>
              
            </Col>
            <Col style={styleApp.center2} >
              <Text style={this.styleTickFreeText(this.state.free,colors.primary)}>Free</Text>
            </Col>
          </Row>
        </Col>
      </Row>
      
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
    this.props.navigation.navigate('CreateEvent1')
  }
  async setDate (data) {
    console.log('setDate')
    console.log(data)
    await this.setState({endDate:data.endDate,startDate:data.startDate})
    this.props.navigation.navigate('CreateEvent1')
  }
  dateTime(start,end) {
    console.log('dateTime !!')
    console.log(start)
    console.log(end)
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
  page1() {
      return (
        <View style={{marginTop:-15}}>
          

          <Text style={[styleApp.title,{fontSize:17,marginTop:20}]}>Sport & Event name</Text>
          {this.sports()}
          {this.tournamentName()}

          <Text style={[styleApp.title,{fontSize:17,marginTop:20}]}>Joining information</Text>
          {this.switch('Public','Private','private')}
          {this.filter()}

          <Text style={[styleApp.title,{fontSize:17,marginTop:20}]}>Entry fee</Text>
          {this.entreeFeeSection('free')}


          <Text style={[styleApp.title,{fontSize:17,marginTop:20}]}>Location</Text>
          {this.address()}

          <Text style={[styleApp.title,{fontSize:17,marginTop:20}]}>Date & Time</Text>
          {this.date()}

        </View>
      )
  }
  conditionOn () {
    if (this.state.name == '' || this.state.joiningFee == '' || (this.state.area == '' && this.state.randomLocation == true) || (this.state.location.address == '' && this.state.randomLocation == false) || this.state.startDate == '') return false
    return true
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1 }}>
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
          loader={false} 
          translateYFooter={this.translateYFooter}
          translateXFooter={this.translateXFooter} 
          click={() => this.props.navigation.navigate('CreateEvent2',{data:this.state,sport:Object.values(this.props.sports).filter(sport => sport.value == this.state.sportsFilter.valueSelected)[0]})}
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

export default connect(mapStateToProps,{})(Page1);

