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

import BackButton from '../../layout/buttons/BackButton'
import Button from '../../layout/buttons/Button'
import ButtonOff from '../../layout/buttons/ButtonOff'
import ButtonRoundOff  from '../../layout/buttons/ButtonRoundOff'
import ButtonRound from '../../layout/buttons/ButtonRound'
import HeaderBackButton from '../../layout/headers/HeaderBackButton'

import ScrollView from '../../layout/scrollViews/ScrollView2'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import AllIcons from '../../layout/icons/AllIcons'
import {date} from '../../layout/date/date'
import Communications from 'react-native-communications';

import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import isEqual from 'lodash.isequal'

class Page0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader:true
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
    console.log(this.state.sportsFilter)
    console.log('llalalalala')
    console.log(this.props.step0)
    if (Object.values(this.props.step0).length != 0) {
      this.setState(this.props.step0)
    } else {
      this.setState({
        initialLoader:false,
        player:this.props.infoUser.coach && this.props.infoUser.coachVerified?false:true,
        coachNeeded:false,
        joiningFee:'',
        free:false,
        sportsFilter:{
          value:Object.values(this.props.sports)[0],
          valueSelected:Object.values(this.props.sports)[0].value,
          listExpend:Object.values(this.props.sports)
        },
        leagueFilter:{
          valueSelected:Object.values(this.props.sports)[0].typeEvent[0].value,
          value:Object.values(this.props.sports)[0].typeEvent[0],
          listExpend:Object.values(this.props.sports)[0].typeEvent
        },
        rulesFilter:{
          valueSelected:Object.values(this.props.sports)[0].rules[0].value,
          value:Object.values(this.props.sports)[0].rules[0],
          listExpend:Object.values(this.props.sports)[0].rules
        }})
    }
    
    // if (this.props.navigation.getParam('sport')!= undefined) {
    //   this.setState({
    //     sportsFilter:{
    //       ...this.state.sportsFilter,
    //       value:this.props.navigation.getParam('sport'),
    //       valueSelected:this.props.navigation.getParam('sport').value,
    //     }
    //     ,
    //     rulesFilter:{
    //       ...this.state.rulesFilter,
    //       value:this.props.navigation.getParam('sport').rules[0],
    //       valueSelected:this.props.navigation.getParam('sport').rules[0].value,
    //       listExpend:this.props.navigation.getParam('sport').rules
    //     }
    //   })
    // }
  }
  sports() {
    console.log('le re render !')
    console.log(this.props.sports)
    return (
      <View style={{borderColor:colors.off,borderBottomWidth:1}}>
      <ExpandableCard 
          option = {this.state.sportsFilter} 
          image={true}

          tickFilter={(value) => {
          var sportsFilter = this.state.sportsFilter
          sportsFilter.value = Object.values(this.props.sports).filter(sport => sport.value == value)[0]
          sportsFilter.valueSelected = value
          console.log('le sport')
          console.log(value)
          this.setState({
            sportsFilter:sportsFilter,
            rulesFilter:{
              valueSelected:sportsFilter.value.rules[0].value,
              value:sportsFilter.value.rules[0],
              listExpend:sportsFilter.value.rules
            },
          })
        }}
      />

      </View>
    )
  }
  leagues() {
    console.log('le re render !')
    console.log(this.props.sports)
    return (
      <View style={{borderColor:colors.off,borderBottomWidth:1}}>
      <ExpandableCard 
          option = {this.state.leagueFilter} 
          image={true}
          
          tickFilter={(value) => {
          var leagueFilter = this.state.leagueFilter
          leagueFilter.value = Object.values(this.props.sports).filter(sport => sport.value == this.state.sportsFilter.valueSelected)[0].typeEvent.filter(item => item.value == value)[0]
          leagueFilter.valueSelected = value
          console.log('le sport')
          console.log(value)
          this.setState({
            leagueFilter:leagueFilter,
            rulesFilter:{
              valueSelected:leagueFilter.value.rules[0].value,
              value:leagueFilter.value.rules[0],
              listExpend:leagueFilter.value.rules
            },
          })
        }}
      />

      </View>
    )
  }
  rules() {
    return (
      <View style={{borderColor:colors.off,borderBottomWidth:1}}>
      <ExpandableCard 
          option = {this.state.rulesFilter} 
          // listExpend={this.state.rulesFilter.listExpend}
          tickFilter={(value) => {
          var rulesFilter = this.state.rulesFilter
          rulesFilter.valueSelected = value
          rulesFilter.value = Object.values(this.state.sportsFilter.value.rules).filter(rule => rule.value == value)[0]
          console.log('le sport')
          console.log(value)
          this.setState({
            rulesFilter:rulesFilter,
          })
        }}
        // listExpend={Object.values(this.props.sports)}
      />
      </View>
    )
  }
  setCoach() {
    if (this.props.infoUser.coach && this.props.infoUser.coachVerified) return this.setState({player:false,coachNeeded:false,joiningFee:'',free:false})
    return this.props.navigation.navigate('Alert',{textButton:'Contact us',onGoBack:() => this.sendMessage(),title:'Access required.',subtitle:'You need to become a verified instructor in order to create an instructor events.',icon:<AllIcons name='exclamation-circle' color={colors.secondary} size={20} type='font' />})
  }
  sendMessage () {
    var email1 = 'contact@getgamefare.com';
    var subject = ''
    Communications.email([email1],null,null, subject ,'');
    this.props.navigation.navigate('CreateEvent0')
  }
  buttonCoach() {
    return (
      <View>
        {
          this.state.player?
          <ButtonOff text="Instructor" click={() => this.setCoach()} backgroundColor={'white'} onPressColor={'white'} textButton={{color:colors.primary}}/>
          :
          <Button text="Instructor" click={() => this.setCoach()} backgroundColor={'primary'} onPressColor={colors.primaryLight}/>
        }
        
        <View style={{height:10}} />
        {
          !this.state.player?
          <ButtonOff text="Player" click={() => this.setState({player:true})} backgroundColor={'white'} onPressColor={'white'} textButton={{color:colors.primary}}/>
          :
          <Button text="Player" click={() => this.setState({player:true})} backgroundColor={'primary'} onPressColor={colors.primaryLight}/>
        }
      </View>
    )
  }
  entreeFeeSection(state){
    return(
      <Row style={{height:60,marginTop:15,}}>
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
        <Col size={20} style={styleApp.center3} activeOpacity={0.7} onPress={() => {
          if (!this.state.free) {
            this.entreeFeeInputRef.blur()
          }
          this.setState({free:!this.state.free,joiningFee:!this.state.free?'0':''})
        }}>
          <Row style={{height:55,width:'100%',}}>
            <Col style={styleApp.center} >          
              <AllIcons name="check" type='mat' color={this.state.free?colors.primary:colors.grey} size={15} />
            </Col>
            <Col style={styleApp.center2} >
              <Text style={[styleApp.text,{color:this.state.free?colors.primary:colors.grey}]}>Free</Text>
            </Col>
          </Row>

        </Col>
      </Row>
      
    )
  }
  openAlertInfo(title,info) {
    this.props.navigation.navigate('Alert',{close:true,textButton:'Got it!',title:title,subtitle:info,icon:<AllIcons type={'font'} name={'info-circle'} color={colors.secondary} size={17} />})
  }
  page0() {
      return (
        <View >

          {this.sports()}
          {this.leagues()}
          {this.rules()}

          {
          this.state.rulesFilter.value.coachNeeded != false?
          <View style={[styleApp.marginView,{marginTop:30}]}>

          <Text style={[styleApp.title,{marginBottom:20}]}>I am a...</Text>

          {this.buttonCoach()}

          {
            this.state.player?
            <TouchableOpacity style={{marginTop:25}} activeOpacity={0.7} onPress={() => this.setState({coachNeeded:!this.state.coachNeeded,joiningFee:!this.state.coachNeeded?this.state.sportsFilter.value.fee.coachMatchFee:'',free:false})}>
            <Row >
              <Col size={15} style={styleApp.center}>
                <AllIcons name='check' type='mat' color={!this.state.coachNeeded?colors.grey:colors.green} size={23} />
              </Col>
              <Col size={85} style={[styleApp.center2,{paddingLeft:15}]}>
                <Text style={[styleApp.text,{fontSize:17,color:!this.state.coachNeeded?colors.grey:colors.green},]}>I need an instructor</Text>
              </Col>
            </Row>
            </TouchableOpacity>
            :null
          }
          </View>
          :null
          }

          <View style={[styleApp.marginView,{marginTop:30}]}>
            <Row style>
              <Col size={80} style={styleApp.center2}>
                <Text style={[styleApp.title]}>Entry fee <Text style={{fontSize:12,fontFamily:'OpenSans-SemiBold'}}>(per player)</Text></Text>
              </Col>
              <Col size={10} style={styleApp.center3} activeOpacity={0.7} onPress={() => this.openAlertInfo('Entry fee per player.',this.state.sportsFilter.value.fee.entryFeeInfo)}>
                <AllIcons type={'font'} name={'info-circle'} color={colors.secondary} size={17} />
              </Col>
            </Row>
            
            
          </View>

          {
            !this.state.coachNeeded?
            this.entreeFeeSection('free')
            :
            <View style={styleApp.marginView}>
            <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular',marginTop:10}]}>We are happy to match you with an instructor. Every player will be charged <Text style={{fontFamily:'OpenSans-SemiBold',color:colors.title}}>${this.state.sportsFilter.value.fee.coachMatchFee}</Text> to participate, which will be payment for the instructor.</Text>
            </View>
            }
        
        </View>
      )
  }
  conditionOn() {
    if (this.state.joiningFee == '') return false
    return true
  }
  valuePlayer() {
    if (!this.state.rulesFilter.value.coachNeeded) {
      return true
    }
    return this.state.player
  }
  async close () {
    console.log('close')
    await this.props.createEventAction('setStep0',this.state)
    return this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))
  }
  async next() {
    await this.props.createEventAction('setStep0',this.state)
    return this.props.navigation.navigate('CreateEvent1',{page0:{...this.state,player:this.valuePlayer()},group:this.props.navigation.getParam('group')})
  }
  render() {
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
          
          contentScrollView={() => this.state.initialLoader?null:this.page0()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={180}
          showsVerticalScrollIndicator={false}
        />
        
        {
          this.conditionOn()?
          <ButtonRound
          icon={'next'} 
          onPressColor={colors.greenLight}
          enabled={this.conditionOn()}
          loader={false} 
          click={() => this.next()}
         />
         :
         <ButtonRoundOff
          icon={'next'} 
          enabled={this.conditionOn()}
          loader={false} 
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
    infoUser:state.user.infoUser.userInfo,
    step0:state.createEventData.step0,
  };
};

export default connect(mapStateToProps,{createEventAction})(Page0);

