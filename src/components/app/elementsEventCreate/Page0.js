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
import Button from '../../layout/buttons/Button'

import Header from '../../layout/headers/HeaderButton'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import Switch from '../../layout/switch/Switch'
import AllIcons from '../../layout/icons/AllIcons'
import DateEvent from './DateEvent'
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
    };
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
          })
        }}
      />
    )
  }
  setCoach() {
    if (this.props.infoUser.coach && this.props.infoUser.coachVerified) return this.setState({player:false,coachNeeded:false})
    return this.props.navigation.navigate('Alert',{close:true,textButton:'Contact us',onGoBack:() => this.sendMessage(),title:'You need to become a verified coach in order to create coach events.',subtitle:'Please contact us.',})
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
          <Button text="Coach" click={() => this.setCoach()} backgroundColor={'white'} onPressColor={colors.primary} textButton={{color:colors.primary}}/>
          :
          <Button text="Coach" click={() => this.setCoach()} backgroundColor={'primary'} onPressColor={colors.primary}/>
        }
        
        <View style={{height:10}} />
        {
          !this.state.player?
          <Button text="Player" click={() => this.setState({player:true})} backgroundColor={'white'} onPressColor={colors.primary} textButton={{color:colors.primary}}/>
          :
          <Button text="Player" click={() => this.setState({player:true})} backgroundColor={'primary'} onPressColor={colors.primary}/>
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
  
  page0() {
      return (
        <View style={{marginTop:-15}}>

          <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>Sport</Text>

          {this.sports()}
          
          <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>I am a...</Text>

          <View style={{height:20}} />
          {this.buttonCoach()}
          
          {
            this.state.player?
            <TouchableOpacity style={{marginTop:25}} activeOpacity={0.7} onPress={() => this.setState({coachNeeded:!this.state.coachNeeded,joiningFee:!this.state.coachNeeded?this.state.sportsFilter.value.fee.coachMatchFee:''})}>
            <Row >
              <Col size={15} style={styleApp.center}>
                <AllIcons name='check' type='mat' color={!this.state.coachNeeded?colors.grey:colors.green} size={23} />
              </Col>
              <Col size={85} style={[styleApp.center2,{paddingLeft:15}]}>
                <Text style={[styleApp.text,{fontSize:17,color:!this.state.coachNeeded?colors.grey:colors.green},]}>I need a coach</Text>
              </Col>
            </Row>
            </TouchableOpacity>
            :null
          }

          <View style={styleApp.divider}/>

          <Text style={[styleApp.title,{fontSize:19,marginTop:10}]}>Entry fee</Text>
          {
            !this.state.coachNeeded?
            this.entreeFeeSection('free')
            :
            <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular',marginTop:10}]}>We are happy to match you with a coach. Every player will be charged <Text style={{fontFamily:'OpenSans-SemiBold',color:colors.title}}>${this.state.sportsFilter.value.fee.coachMatchFee}</Text> to participate, which will be payment for the coach.</Text>
          }


        </View>
      )
  }
  conditionOn() {
    if (this.state.joiningFee == '') return false
    return true
  }
  render() {
    return (
      <View style={[styleApp.stylePage]}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page0.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />

        <ButtonRound
          icon={'next'} 
          enabled={this.conditionOn()}
          loader={false} 
          click={() => this.props.navigation.navigate('CreateEvent1',{page0:this.state})}
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
    infoUser:state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps,{})(Page0);

