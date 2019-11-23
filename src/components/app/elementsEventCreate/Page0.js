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

class Page0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player:this.props.infoUser.coach && this.props.infoUser.coachVerified?false:true,
      coachNeeded:false,
      joiningFee:'',
      free:false,
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
      rulesFilter:{
        text:"rules",
        value:'rules',
        type:'rules',
        expendable:true,
        alwaysExpanded:true,
        valueSelected:Object.values(this.props.sports)[0].rules[0].value,
        value:Object.values(this.props.sports)[0].rules[0],
        listExpend:Object.values(this.props.sports)[0].rules
      },
    };
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Organize an event',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  componentDidMount() {
    console.log('page 1 mount')
    console.log(this.state.sportsFilter)
    if (this.props.navigation.getParam('sport')!= undefined) {
      this.setState({
        sportsFilter:{
          ...this.state.sportsFilter,
          value:this.props.navigation.getParam('sport'),
          valueSelected:this.props.navigation.getParam('sport').value,
        }
        ,
        rulesFilter:{
          ...this.state.rulesFilter,
          value:this.props.navigation.getParam('sport').rules[0],
          valueSelected:this.props.navigation.getParam('sport').rules[0].value,
          listExpend:this.props.navigation.getParam('sport').rules
        }
      })
    }
  }
  sports() {
    return (
      <ExpandableCard 
          option = {this.state.sportsFilter} 
          tickFilter={(value) => {
          var sportsFilter = this.state.sportsFilter
          sportsFilter.value = Object.values(this.props.sports).filter(sport => sport.value == value)[0]
          sportsFilter.valueSelected = value
          console.log('le sport')
          console.log(value)
          this.setState({
            sportsFilter:sportsFilter,
            rulesFilter:{
              text:"rules",
              value:'rules',
              type:'rules',
              expendable:true,
              alwaysExpanded:true,
              valueSelected:sportsFilter.value.rules[0].value,
              value:sportsFilter.value.rules[0],
              listExpend:sportsFilter.value.rules
            },
          })
        }}
      />
    )
  }
  rules() {
    return (
      <ExpandableCard 
          option = {this.state.rulesFilter} 
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
      />
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
      <Row style={{height:55}}>
        <Col size={60} style={styleApp.center2}>
          <TouchableOpacity activeOpacity={0.7}  onPress={() => this.entreeFeeInputRef.focus()} style={styleApp.inputForm}>
            <Row>
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
        <Col size={40} style={styleApp.center3} activeOpacity={0.7} onPress={() => {
          if (!this.state.free) {
            this.entreeFeeInputRef.blur()
          }
          this.setState({free:!this.state.free,joiningFee:!this.state.free?'0':''})
        }}>
          <Row style={[styleApp.cardSelect,{borderWidth:0,shadowOpacity:0}]}>
            <Col style={styleApp.center} >          
              <View style={{}}>
                <AllIcons name="check" type='mat' color={this.state.free?colors.primary:colors.grey} size={15} />
              </View>
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
        <View style={{marginTop:-15,marginLeft:0,width:width}}>

          <View style={styleApp.marginView}>


 

          {this.sports()}
          {this.rules()}
          </View>

          {
        this.state.rulesFilter.value.coachNeeded?
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
            
            {
            !this.state.coachNeeded?
            this.entreeFeeSection('free')
            :
            <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular',marginTop:10}]}>We are happy to match you with an instructor. Every player will be charged <Text style={{fontFamily:'OpenSans-SemiBold',color:colors.title}}>${this.state.sportsFilter.value.fee.coachMatchFee}</Text> to participate, which will be payment for the instructor.</Text>
            }
          </View>
        
        

          

          


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
  render() {
    return (
      <View style={[styleApp.stylePage]}>


        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        close={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
        textHeader={'Organize your event'}
        inputRange={[5,10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1='arrow-left'
        icon2={null}
        clickButton1={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))} 
        />

        <ScrollView
          onRef={ref => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          
          contentScrollView={this.page0.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={180}
          showsVerticalScrollIndicator={true}
        />
        
        {
          this.conditionOn()?
          <ButtonRound
          icon={'next'} 
          onPressColor={colors.greenLight2}
          enabled={this.conditionOn()}
          loader={false} 
          click={() => this.props.navigation.navigate('CreateEvent1',{page0:{...this.state,player:this.valuePlayer()},group:this.props.navigation.getParam('group')})}
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
  };
};

export default connect(mapStateToProps,{})(Page0);

