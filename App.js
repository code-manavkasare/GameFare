import React, {Component} from 'react';
import AppSwitchNavigator from './src/components/navigation/AppNavigator'
import NavigationService from './NavigationService';

import { createAppContainer , createStackNavigator,StackActions} from 'react-navigation';
import SplashScreen from 'react-native-splash-screen';
import branch, { BranchEvent } from 'react-native-branch'
import StatusBar from '@react-native-community/status-bar';
import firebase from 'react-native-firebase'
import {connect} from 'react-redux';
import {indexEvents,indexGroups} from './src/components/database/algolia'

import axios from 'axios'
import {globaleVariablesAction} from './src/actions/globaleVariablesActions'
import {userAction} from './src/actions/userActions'
const AppContainer = createAppContainer(AppSwitchNavigator)

class App extends Component {
  async componentDidMount() { 
    SplashScreen.hide()
    this.initBranch()

    StatusBar.setHidden(true, "slide")
    StatusBar.setBarStyle('light-content',true)
    if (this.props.userID != '') {
      this.autoSignIn()
    }
  }
  async autoSignIn() {
    var url = 'https://us-central1-getplayd.cloudfunctions.net/signUpUser'
    const promiseAxios = await axios.get(url, {
      params: {
        phone: this.props.phoneNumber,
        countryCode:'+'+this.props.countryCode,
        giftAmount: 0
      }
    })

    if (promiseAxios.data.response != false) {    
      await this.props.userAction('signIn',{
        userID:this.props.userID,
        firebaseSignInToken: promiseAxios.data.firebaseSignInToken, 
        phoneNumber:this.props.phoneNumber,
        countryCode:this.props.countryCode
      })
    }
    return true
  }
  initBranch() {
    var that = this
    branch.subscribe(({ error, params }) => {
      if (error) {
        console.log("Error from Branch: " + error)
        return
      }
      console.log('branch link opened !')
      console.log(params)
      if (params.action == 'openEventPage') {
        that.openEvent(params.eventID)        
      } else if (params.action == 'openGroupPage') {
        that.openGroup(params.eventID)        
      } else if (params.type == 'share') {
        ls.save('giftShare', params.value)
      }
    })
  }
  async openEvent(eventID) {
    var data = await indexEvents.getObject(eventID)
    NavigationService.navigate('Event',{data:data,pageFrom:'Home'})
  }
  async openGroup(eventID) {
    var data = await indexGroups.getObject(eventID)
    NavigationService.navigate('Group',{data:data,pageFrom:'Home'})
  }
  render() {
    return <AppContainer ref={navigatorRef => {
      NavigationService.setTopLevelNavigator(navigatorRef);
    }}/>
  }
}

const  mapStateToProps = state => {
  return {
    userID:state.user.userIDSaved,
    phoneNumber:state.user.phoneNumber,
    countryCode:state.user.countryCode
  };
};

export default connect(mapStateToProps,{globaleVariablesAction,userAction})(App);
