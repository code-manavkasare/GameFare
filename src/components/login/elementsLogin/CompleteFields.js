import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  InputAccessoryView,
  View
} from 'react-native';
import NavigationService from '../../../../NavigationService'

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import { Col, Row, Grid } from "react-native-easy-grid";
import axios from 'axios'
import firebase from 'react-native-firebase'
import colors from '../../style/colors'
import styleApp from '../../style/style'
import Button from '../../layout/buttons/Button';
import ButtonFull from '../../layout/buttons/ButtonFull';

const { height, width } = Dimensions.get('screen')

export default class CompleteFields extends Component {
    constructor(props) {
        super(props);
        this.state = {
          loader:false,
          firstname:'',
          lastname:'',
        };
      }
    async confirm() {
      this.setState({loader:true})
      await firebase.database().ref('users/' + this.props.params.userID + '/userInfo/').update({
        firstname:this.state.firstname,
        lastname:this.state.lastname,
      })
      await firebase.database().ref('users/' + this.props.params.userID ).update({profileCompleted:true})
      await this.secondTextInput.blur()
      var that = this
      setTimeout(function(){
        NavigationService.navigate(that.props.pageFrom)
      }, 550)
    }
  render() {
    return (      
        <View style={styles.content}>
              
          <Text style={[styleApp.title,{marginBottom:20,fontSize:21}]}>Complete your profile</Text>

          {/* <Text style={[styleApp.title]}>{this.props.params.userID}</Text> */}
          <Text style={[styleApp.title,{marginBottom:0,fontSize:16}]}>First name</Text>
          <Row style={styleApp.inputForm}>
            <Col style={styleApp.center2}>
              <TextInput
                style={styleApp.input}
                placeholder="First name"
                autoFocus={true}
                autoCorrect={true}
                underlineColorAndroid='rgba(0,0,0,0)'
                blurOnSubmit={ false }
                returnKeyType={ 'done' }
                // onSubmitEditing={() => { this.secondTextInput.focus(); }}
                inputAccessoryViewID={'firstname'}
                onChangeText={text => this.setState({firstname:text})}
                value={this.state.firstname}
              />
            </Col>
          </Row>

          <Text style={[styleApp.title,{marginTop:20,fontSize:16}]}>Last name</Text>
          <Row style={[styleApp.inputForm,{marginTop:10}]}>
            <Col style={styleApp.center2}>
              <TextInput
                style={styleApp.input}
                placeholder="Last name"
                returnKeyType={'done'}
                underlineColorAndroid='rgba(0,0,0,0)'
                autoCorrect={true}
                // onSubmitEditing={() => { this.thirdTextInput.focus(); }}
                ref={(input) => { this.secondTextInput = input }}
                inputAccessoryViewID={'lastname'}
                onFocus={() => { this.setState({step: 'last'}) }}
                onChangeText={text => this.setState({lastname:text})}
                value={this.state.lastname}
              />
            </Col>
          </Row>
          
            


          <InputAccessoryView nativeID={'firstname'}>
            <ButtonFull backgroundColor={'green'} onPressColor={colors.greenClick} loader={this.state.loader} click={() => this.secondTextInput.focus()} enable={this.state.firstname != ''} text={'Next'} />
          </InputAccessoryView>

          <InputAccessoryView nativeID={'lastname'}>
            <ButtonFull backgroundColor={'green'} onPressColor={colors.greenClick} loader={this.state.loader} click={() => this.confirm()} enable={this.state.firstname != '' && this.state.lastname != ''} text={'Confirm'} />
          </InputAccessoryView>







        </View>
    );
  }
}

const styles = StyleSheet.create({
  content:{
    flex:1,
    width:'100%',
    paddingLeft:20,paddingRight:20,
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

