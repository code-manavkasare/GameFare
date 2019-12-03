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

import Switch from '../../layout/switch/Switch'
import ButtonRoundOff  from '../../layout/buttons/ButtonRoundOff'
import ButtonRound from '../../layout/buttons/ButtonRound'
import Button from '../../layout/buttons/Button'
import HeaderBackButton from '../../layout/headers/HeaderBackButton'


import ScrollView from '../../layout/scrollViews/ScrollView2'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import AllIcons from '../../layout/icons/AllIcons'
import Communications from 'react-native-communications';

import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import isEqual from 'lodash.isequal'

class Page0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  shouldComponentUpdate(nextProps,nextState) {
    // if (!isEqual(this.state,nextState)) return true
    // return false
    return true
  }
  
  async componentDidMount() {
    console.log('page 1 mount')
    console.log(this.props.step0)
    if (this.props.step0.sport == ''){
      this.setSport(this.props.sports[0])
    }
  }
  async setSport(data) {
    console.log('ici spot')
    await this.props.createEventAction('setStep0',{
      sport:data.value,
      rule:data.typeEvent[0].rules[0].value,
      level:data.level.list[0].value,
      league:data.typeEvent[0].value
    })
    return true
  }

  async setLeague(data) {
    console.log('ici spot')
    await this.props.createEventAction('setStep0',{
      rule:data.rules[0].value,
      league:data.value
    })
    return true
  }

  async setRule(data) {
    console.log('ici spot')
    await this.props.createEventAction('setStep0',{
      rule:data.value,
    })
    return true
  }


  sports() {
    console.log('le re render !')
    console.log(this.props.sports)
    return (
      <View style={{borderColor:colors.off,borderBottomWidth:1}}>
      <ExpandableCard 
          list={this.props.sports}
          valueSelected={this.props.step0.sport}
          image={true}
          tickFilter={(value) => this.setSport(value)}
      />

      </View>
    )
  }
  leagues(sport) {
    console.log('le re renderleagues !')
    return (
      <View style={{borderColor:colors.off,borderBottomWidth:1}}>
      <ExpandableCard 
          list={sport.typeEvent} 
          valueSelected={this.props.step0.league}
          image={true}
          tickFilter={(value) => this.setLeague(value)}
      />

      </View>
    )
  }
  rules(sport) {
    return (
      <View style={{borderColor:colors.off,borderBottomWidth:1}}>
      <ExpandableCard 
          list={sport.typeEvent.filter(league => league.value == this.props.step0.league)[0].rules} 
          valueSelected={this.props.step0.rule}
          // image={true}
          tickFilter={(value) => this.setRule(value)}
      />
      </View>
    )
  }
  async setCoach(val) {
    console.log('setCoach ' + val)
    if (!val) {
      await this.props.createEventAction('setStep0',{
        
        coach:val,
      })
      return true
    }

    if (this.props.infoUser.coach && this.props.infoUser.coachVerified) {
      await this.props.createEventAction('setStep0',{
        
        coach:val,
        coachNeeded:false,joiningFee:'',free:false
      })
      return true
    }
    await this.props.navigation.navigate('Alert',{textButton:'Contact us',onGoBack:() => this.sendMessage(),title:'Access required.',subtitle:'You need to become a verified instructor in order to create an instructor events.',icon:<AllIcons name='exclamation-circle' color={colors.secondary} size={20} type='font' />})
    return false
  }
  sendMessage () {
    var email1 = 'contact@getgamefare.com';
    var subject = ''
    Communications.email([email1],null,null, subject ,'');
    this.props.navigation.navigate('CreateEvent0')
  }
  buttonCoach(sport) {
    return (
      <View>
        {this.switch('Player','Instructor','coach',(val) => this.setCoach(val))}

        {
            !this.props.step0.coach?
            <TouchableOpacity style={{marginTop:25}} activeOpacity={0.7} onPress={() => this.props.createEventAction('setStep0',{coachNeeded:!this.props.step0.coachNeeded,joiningFee:!this.props.step0.coachNeeded?sport.fee.coachMatchFee:'',free:false})}>
            <Row >
              <Col size={15} style={styleApp.center}>
                <AllIcons name='check' type='mat' color={!this.props.step0.coachNeeded?colors.grey:colors.green} size={23} />
              </Col>
              <Col size={85} style={[styleApp.center2,{paddingLeft:15}]}>
                <Text style={[styleApp.text,{fontSize:17,color:!this.props.step0.coachNeeded?colors.grey:colors.green},]}>I need an instructor</Text>
              </Col>
            </Row>
            </TouchableOpacity>
            :null
          }
      </View>
    )
  }
  entreeFeeSection(state){
    return(
      <Row style={{height:60,marginTop:15,paddingRight:20,paddingLeft:20}}>
        <Col size={60} style={styleApp.center2}>
          <TouchableOpacity activeOpacity={0.7}  onPress={() => this.entreeFeeInputRef.focus()} >
            <Row style={{height:60}}>
              <Col style={styleApp.center} size={25}>
                <AllIcons name='dollar-sign' size={18} color={colors.title} type='font'/>
              </Col>
              <Col style={[styleApp.center2,{paddingLeft:15}]} size={75}>
                <TextInput
                  style={styleApp.input}
                  placeholder="Entry fee"
                  returnKeyType={'done'}
                  keyboardType={'phone-pad'}
                  ref={(input) => { this.entreeFeeInputRef = input }}
                  underlineColorAndroid='rgba(0,0,0,0)'
                  autoCorrect={true}
                  onChangeText={text => {
                    if (text.length == 0 && this.props.step0.joiningFee.length != 0) {
                      this.props.createEventAction('setStep0',{
                        
                        joiningFee:text,
                        free:true
                      })
                    }
                    else if (Number(text) == 0 ) {
                      this.props.createEventAction('setStep0',{
                        
                        joiningFee:text,
                        free:true
                      })
                    } else {
                      if (Number(text).toString() == 'NaN'){
                        return this.props.createEventAction('setStep0',{
                          
                          joiningFee:text.replace(text[text.length-1],''),
                          free:false
                        })
                      }
                      return this.props.createEventAction('setStep0',{
                        
                        joiningFee:text,
                        free:false
                      })
                    }          
                  }}
                  value={this.props.step0.joiningFee}
                />
              </Col>
            </Row>
          </TouchableOpacity>
        </Col>
        <Col size={20} style={styleApp.center3} activeOpacity={0.7} onPress={() => {
          if (!this.props.step0.free) {
            this.entreeFeeInputRef.blur()
          }
          this.props.createEventAction('setStep0',{
            
            free:!this.props.step0.free,
            joiningFee:!this.props.step0.free?'0':''
          })
        }}>
          <Row style={{height:55,width:'100%',}}>
            <Col style={styleApp.center} >          
              <AllIcons name="check" type='font' color={this.props.step0.free?colors.primary:colors.grey} size={16} />
            </Col>
            <Col style={styleApp.center3} >
              <Text style={[styleApp.input,{fontSize:17},{color:this.props.step0.free?colors.primary:colors.grey}]}>Free</Text>
            </Col>
          </Row>

        </Col>
      </Row>
      
    )
  }
  openAlertInfo(title,info) {
    this.props.navigation.navigate('Alert',{close:true,textButton:'Got it!',title:title,subtitle:info,icon:<AllIcons type={'font'} name={'info-circle'} color={colors.secondary} size={17} />})
  }
  switch (textOn,textOff,state,click) {
    return (
      <Switch 
        textOn={textOn}
        textOff={textOff}
        translateXTo={width/2-20}
        height={50}
        state={this.props.step0[state]}
        setState={(val) => click(val)}
      />
    )
  }
  page0(sport,league,rule) {
    console.log('render page 0')
    // var rule = sport.typeEvent.filter(league => league.value == this.props.step.league)[0].rules.filter(rule => rule.value == this.props.step0.rule)[0].coachNeeded
      return (
        <View >

          {this.sports()}
          {this.leagues(sport)}
          {this.rules(sport)}

          {
          rule.coachNeeded != false?
          <View style={[styleApp.marginView,{marginTop:20}]}>

          <Text style={[styleApp.title,{marginBottom:20}]}>I am a...</Text>

          {this.buttonCoach(sport)}

          
          </View>
          :null
          }

          <View style={[styleApp.marginView,{marginTop:30}]}>
            <Row style>
              <Col size={80} style={styleApp.center2}>
                <Text style={[styleApp.title]}>Entry fee <Text style={{fontSize:12,fontFamily:'OpenSans-SemiBold'}}>(per player)</Text></Text>
              </Col>
              <Col size={10} style={styleApp.center3} activeOpacity={0.7} onPress={() => this.openAlertInfo('Entry fee per player.',sport.fee.entryFeeInfo)}>
                <AllIcons type={'font'} name={'info-circle'} color={colors.secondary} size={17} />
              </Col>
            </Row>
            
            
          </View>

          {
            !this.props.step0.coachNeeded?
            this.entreeFeeSection('free')
            :
            <View style={styleApp.marginView}>
            <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular',marginTop:10}]}>We are happy to match you with an instructor. Every player will be charged <Text style={{fontFamily:'OpenSans-SemiBold',color:colors.title}}>${sport.fee.coachMatchFee}</Text> to participate, which will be payment for the instructor.</Text>
            </View>
            }
        
        </View>
      )
  }
  conditionOn() {
    if (this.props.step0.joiningFee == '') return false
    return true
  }
  close () {
    this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))
  }
  next(sport) {
    this.props.navigation.navigate('CreateEvent1',{group:this.props.navigation.getParam('group'),sport:sport})
  }
  render() {
    if (this.props.step0.sport == '') return null
    var sport = this.props.sports.filter(sport => sport.value == this.props.step0.sport)[0]
    var league = Object.values(sport.typeEvent).filter(item => item.value == this.props.step0.league)[0]
    var rule = Object.values(league.rules).filter(rule => rule.value == this.props.step0.rule)[0]
    console.log('le sport page 0')
    console.log(sport)
    console.log(league)
    console.log(rule)
    // return null
    return (
      <View style={[styleApp.stylePage]}>


        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={'Organize your event'}
        inputRange={[5,10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1='arrow-left'
        icon2={null}
        clickButton1={() => this.close()} 
        />

        <ScrollView
          onRef={ref => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          
          contentScrollView={() => this.page0(sport,league,rule)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={180}
          showsVerticalScrollIndicator={false}
        />
        

        <View style={[styleApp.footerBooking,styleApp.marginView]}>
          {
            this.conditionOn()?
            <Button
            text='Next'
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            enabled={this.conditionOn()}
            loader={this.state.loader} 
            click={() => this.next(sport)}
          />
          :
          <Button
            icon={'Next'} 
            text='Next'
            backgroundColor={'green'}
            styleButton={{borderWidth:1,borderColor:colors.grey}}
            disabled={true}
            onPressColor={colors.greenLight}
            loader={false} 
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
    infoUser:state.user.infoUser.userInfo,
    step0:state.createEventData.step0,
  };
};

export default connect(mapStateToProps,{createEventAction})(Page0);

