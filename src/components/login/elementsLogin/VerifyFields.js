import React, {Component,createRef} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions
} from 'react-native';

import CodeFiled from 'react-native-confirmation-code-field';
import Loader from '../../layout/loaders/Loader'
import styleApp from '../../style/style'
import colors from '../../style/colors'
import { Col, Row, Grid } from "react-native-easy-grid";
import firebase from 'react-native-firebase'
import axios from 'axios'
import {connect} from 'react-redux';

import {userAction} from '../../../actions/userActions'
const { height, width } = Dimensions.get('screen')

class VerifyFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verifCode:'',
      loader: true,
      step:'sending'
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    // this.verifPhone = this.verifPhone.bind(this)
    this.sendSMS = this.sendSMS.bind(this)
  }
  field = createRef();
  containerProps = { style: styles.inputWrapStyle };
  colors = ['#ff595f', '#e42959'];
  componentDidMount() {
    console.log('verify field mount')
    // console.log(this.props.user)
    this.sendSMS()
  }
  async sendSMS () {
    console.log('sens sms')
    this.setState({loader:true,step:'sending'})
    var phoneNumber = this.props.params.phoneNumber
    phoneNumber = phoneNumber.replace('-','')
    phoneNumber = phoneNumber.replace('(','')
    phoneNumber = phoneNumber.replace(')','')
    phoneNumber = phoneNumber.replace(/ /g,'')

    var url = 'https://us-central1-getplayd.cloudfunctions.net/sendSMSVerification'
    const promiseAxios = await axios.get(url, {
      params: {
        phoneNumber: phoneNumber,
        countryCode: this.props.params.country.callingCode,
        userID: this.props.params.userID,
      }
    })
    if (promiseAxios.data.response == false) {
      this.setState({step:'wrongNumber',loader:false})
    } else {
      this.setState({step:'sent',loader:false})
    }
  }
  onFinishCheckingCode (val) {
    this.verifPhone (val)
  }
  cellProps = ({ /*index, isFocused,*/ hasValue }) => {
    if (hasValue) {
      return {
        style: [styles.input, styles.inputNotEmpty],
      };
    }
    return {
      style: styles.input,
    };
  };
  async verifPhone (code) {
    this.setState({step:'verifying',loader:true})
    var url = 'https://us-central1-getplayd.cloudfunctions.net/verifyPhone'
    var phoneNumber = this.props.params.phoneNumber
    console.log('le phone nymberrr oupaaaaaaaaaaaaaaaaaa')
    console.log(phoneNumber)
    phoneNumber = phoneNumber.replace('-','')
    phoneNumber = phoneNumber.replace('(','')
    phoneNumber = phoneNumber.replace(')','')
    phoneNumber = phoneNumber.replace(/ /g,'')
    const promiseAxios = await axios.get(url, {
      params: {
        phoneNumber: phoneNumber,
        countryCode: this.props.params.country.callingCode,
        userID: this.props.params.userID,
        code: code.toString(),
      }
    })
    if (promiseAxios.data.response == false) {
      this.clearCode()
      // this.field.focus()
      this.setState({
        step:'error',
        verifCode:'',
        loader:false
      })
    } else {
      this.setState({step:'signIn'})
      var profileCompleted = await firebase.database().ref('users/' + this.props.params.userID + '/profileCompleted').once('value')
      profileCompleted = profileCompleted.val()
      await this.props.userAction('signIn',{
        userID:this.props.params.userID,
        firebaseSignInToken: this.props.params.firebaseSignInToken, 
        phoneNumber:phoneNumber,
        countryCode:this.props.params.country.callingCode
      })
      console.log('this.props.profileCompleted')
      console.log(profileCompleted)
      if (profileCompleted) {
        var that = this
        setTimeout(function(){
          that.props.navigate(that.props.pageFrom)
        }, 550)
      } else {
        this.props.navigate('Complete',{data:{userID:this.props.params.userID},pageFrom:this.props.pageFrom})
      }
    }
  }
  clearCode() {
    const { current } = this.field;
    if (current) {
      current.clear();
      current.focus()
    }
  }
  loader() {
    if (this.state.loader) return <View style={[styles.center,{marginTop:10}]}><Loader color={'green'} size={27}/></View>
    return null
  }
  buttonResend () {
    if (!this.state.loader) {
      return (
        <Row style={{height:30}}>
          <Col style={styles.center}>
            <TouchableOpacity activeOpacity={0.7} onPress={()=> {this.sendSMS()} } style={{marginTop:3}}>
              <Text style={styles.textOn}>Resend SMS</Text>
            </TouchableOpacity>
          </Col>
        </Row>
      )
    }
    return null
  }
  statusSMS () {
    return (
      <Col style={styles.center}>
        {
          this.state.step == 'verifying'?
          <Text style={styles.text}>Verifying code...</Text>        
          :this.state.step == 'signIn'?
          <Text style={styles.text}>We are signing you in...</Text>     
          :this.state.step == 'sending'?
          <Text style={styles.text}>SMS being sent...</Text>
          :this.state.step == 'error'?
          <Text style={styles.text}>Wrong code</Text>
          :this.state.step == 'wrongNumber'?
          <Text style={styles.text}>Error, verify your number</Text>
          :this.state.step == 'sent'?
          <Text style={styles.text}>SMS sent.</Text>
          :null
        }
      </Col>
    )
  }
  subtitle() {
    return 'Enter the code sent to +' +this.props.params.country.callingCode + ' ' + this.props.params.phoneNumber
  }
  verify() {
    return (
      <View style={styleApp.marginView}>
          <Text style={[styleApp.title,{marginBottom:10}]}>Verification code</Text>
          <Text style={[styleApp.subtitle,{marginBottom:10}]}>{this.subtitle()}</Text>
          <View style={styles.inputWrapper}>
              <CodeFiled
                blurOnSubmit={true}
                variant="clear"
                autoFocus={true}
                codeLength={4}
                keyboardType="numeric"
                ref={this.field}
                cellProps={this.cellProps}
                containerProps={this.containerProps}
                onFulfill={(code) => this.onFinishCheckingCode(code)}
              />
            </View>


            <Row style={{height:40}}>
              {this.statusSMS()}
            </Row>
            {this.loader()}
            

            {this.buttonResend()}
      </View>
    )
  }
  render() {
    return this.verify()
  }
}

const styles = StyleSheet.create({
  inputWrapper: {
    alignItems: 'center',
    marginTop:10,
    height:80,
    width:'100%',
    // justifyContent: 'center',
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapStyle: {
    height: 50,
    marginTop: 5,
  },
  text:{
    fontSize:14,
    color:colors.title,
    fontFamily:'OpenSans-SemiBold'
  },
  textOn:{
    fontSize:14,
    color:colors.green,
    fontFamily:'OpenSans-SemiBold'
  },
  inputNotEmpty: {
    backgroundColor: colors.green,
  },
  input: {
    height: 55,
    width: 50,
    borderRadius: 4,
    color: 'white',
    fontFamily: 'OpenSans-SemiBold',
    backgroundColor: 'white',
    borderWidth:1,
    borderColor:'#E5E3E3',
    ...Platform.select({
      web: {
        lineHeight: 46,
      },
    }),
    shadowColor: '#46474B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
  },
});

const  mapStateToProps = state => {
  return {
      user:state.user
  };
};

export default connect(mapStateToProps,{userAction})(VerifyFields);
