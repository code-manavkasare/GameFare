import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  View
} from 'react-native';
import {connect} from 'react-redux';
// import {updateStepLogin} from '../../../actions/loginActions'
// import {initApp} from '../../../actions/initAppActions'

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import { Col, Row, Grid } from "react-native-easy-grid";
import axios from 'axios'

import colors from '../../style/colors'
import styleApp from '../../style/style'
import Button from '../../layout/buttons/Button';
const ListCountry = require('../elementsFlags/listCountry.json')


const { height, width } = Dimensions.get('screen')

class PhoneFields extends Component {
    constructor(props) {
        super(props);
        this.state = {
          loader:false,
          phoneNumber:'',
        };
        this.changePhone = this.changePhone.bind(this)
      }
      UNSAFE_componentWillMount(){
      // this.props.onRef(this)
      // this.props.initApp('setStepLogin',{value:'phone'})
      console.log('cpountry2')
      console.log(this.props.country)
    }
    focusPhoneField () {
      this.firstTextInput.focus()
    }
    shouldComponentUpdate(nextProps,nextState) {
      if (this.state !== nextState) return true
      else if (this.props.country !== nextProps.country) return true
      return false
    }
    async next(phone) {
      console.log('sign up')
      // this.firstTextInput.blur()
      this.setState({loader:true})
      var url = 'https://us-central1-getplayd.cloudfunctions.net/signUpUser'
      var phoneNumber = phone
      phoneNumber = phoneNumber.replace('-','')
      phoneNumber = phoneNumber.replace(')','')
      phoneNumber = phoneNumber.replace('(','')
      phoneNumber = phoneNumber.replace(' ','')
      // var giftAmount = Number(this.props.giftAmount)

      const promiseAxios = await axios.get(url, {
        params: {
          phone: phoneNumber,
          countryCode:this.props.country.dial_code,
          giftAmount: 0
        }
      })
      
      console.log('promiseAxios')
      console.log(promiseAxios.data)
      console.log(phoneNumber)
      
      if (promiseAxios.data.response != false) { 
        await this.setState({loader:false})
        await this.props.navigate('Verify',{data:{...promiseAxios.data,phoneNumber:phone,country:this.props.country}})
      } else {
        this.setState({error:true,loader:false})
      }
    }
    changePhone (val) {
      var currentVal = this.state.phoneNumber
      var newVal = val
      if (val.length == 1 && currentVal.length == 0) {
        newVal = '(' + newVal
        this.setState({phoneNumber:newVal})
      } else if (val.length == 1 && currentVal.length == 2) {
        this.setState({phoneNumber:''})
      } else if (val.length == 4 && currentVal.length == 3) {
        newVal = newVal + ') '
        this.setState({phoneNumber:newVal})
      } else if (val.length == 5 && currentVal.length == 4) {
        newVal = currentVal + ') ' +val[3]
        this.setState({phoneNumber:newVal})
      } else if ((val.length == 6 && currentVal.length == 7) || (val.length == 5 && currentVal.length == 6) ) {
        newVal = newVal.replace(')','')
        newVal = newVal.replace(' ','')
        this.setState({phoneNumber:newVal})
      } else if (val.length == 9 && currentVal.length == 8) {
        newVal = newVal + '-'
        this.setState({phoneNumber:newVal})
      } else if (val.length == 10 && currentVal.length == 9) {
        newVal = currentVal + '-' + newVal[9]
        this.setState({phoneNumber:newVal})
      } else if (val.length == 10 && currentVal.length == 11) {
        newVal = newVal.slice(0,8)
        this.setState({phoneNumber:newVal})
      }  else if (val.length == 9 && currentVal.length == 10) {
        newVal = newVal.slice(0,8)
        this.setState({phoneNumber:newVal})
      }else if (val.length == 14) {
        this.setState({phoneNumber:newVal})
        this.next(newVal)
      } else {
        this.setState({phoneNumber:newVal})
      }
    }
    buttonSubmit() {
      return <Button styleButton={{marginTop:15}} loader={this.state.loader} click={() => this.next(this.state.phoneNumber)} text="Sign in"/>
    }
    inputPhone () {
      return (
        <TextInput
          style={styles.input}
          placeholder={'(012) 345 6789'}
          placeholderTextColor={"#AFAFAF"}
          autoCapitalize = "none"
          underlineColorAndroid='rgba(0,0,0,0)'
          autoCorrect = {true}
          autoFocus={true}
          ref={(input) => { this.firstTextInput = input }}
          keyboardType={'phone-pad'}
          returnKeyType={ 'done' }
          onChangeText={text => this.changePhone(text) }
          value={this.state.phoneNumber}
        />
      )
    }
    countryCol () {
      return (
        <Row>
          <Col style={styles.center} size={50}>
            <Image source={{uri:'data:image/png;base64,'+Object.values(ListCountry).filter(country => this.props.country.code == country.code)[0].flag}} style={{width:24,height:16,borderRadius:2}} /> 
          </Col>
          <Col style={[styles.center2,{backgroundColor:'white'}]} size={30}>
            <MatIcon name='keyboard-arrow-down' color='#757575' size={15}/>  
          </Col>
        </Row>
      )
    }
  render() {
    return (      
        <View style={styles.content}>
              <Row>
                <Col size={20} style={[{borderRightWidth:0,borderColor:'#EAEAEA'}]} activeOpacity={0.8} onPress={() => {this.props.navigate('ListCountry',{})}}>
                  {this.countryCol()}
                </Col>
                <Col size={15} style={[styles.center,{borderBottomWidth:0,borderColor:'#EAEAEA'}]}>
                  <Text style={styles.countryCode}>{this.props.country.dial_code}</Text>
                </Col>
                <Col size={80} style={[styles.center,{marginRight:10,},{borderBottomWidth:0,borderColor:'#EAEAEA'}]}>
                  {this.inputPhone()}
                </Col>
              </Row>
              
              {this.buttonSubmit()}

        </View>


    );
  }
}

const styles = StyleSheet.create({
  content:{
    flex:1,
    width:'100%',
  },
  rowScreen:{
    height:55,
    width:'100%',   
    marginTop:0,
    borderRadius:5,
    paddingHorizontal:8,
    fontSize:15,
    fontFamily: 'OpenSans-Regular',
    borderWidth: 0,
    shadowColor: '#46474B',
    shadowOffset: { width: 0, height: 2 },
    backgroundColor:'white',
    shadowOpacity: 0,
    shadowRadius: 5,
    justifyContent: 'center',
    borderColor:'#eaeaea',
  },
  input:{
    height:40,
    width:'100%',  
    backgroundColor:'white',   
    borderRadius:3,
    paddingHorizontal:8,
    fontSize:16,
    fontFamily: 'OpenSans-SemiBold',
    color:'#4A4A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCode:{
    fontSize:16,
    fontFamily: 'OpenSans-Bold',
    color:'#4A4A4A',
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    // alignItems: 'center',
    justifyContent: 'center',
  },
});

const  mapStateToProps = state => {
  return {
    // country:state.user.country,
  };
};

export default connect(mapStateToProps,{})(PhoneFields);
