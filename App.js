if(__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
}

import React, {Component} from 'react';
import AppSwitchNavigator from './src/components/navigation/AppNavigator'
import NavigationService from './NavigationService';

import { createAppContainer , createStackNavigator,StackActions} from 'react-navigation';
import SplashScreen from 'react-native-splash-screen';
import StatusBar from '@react-native-community/status-bar';
import {connect} from 'react-redux';

import firebase from 'react-native-firebase';
import axios from 'axios';
import {globaleVariablesAction} from './src/actions/globaleVariablesActions';
import {userAction} from './src/actions/userActions';
import {updateUserFCMToken} from './src/components/functions/notifications';
const AppContainer = createAppContainer(AppSwitchNavigator);

class App extends Component {
  async componentDidMount() { 
    SplashScreen.hide();

    StatusBar.setHidden(true, 'slide');
    StatusBar.setBarStyle('light-content',true);
    if (this.props.userID !== '') {
      this.autoSignIn();
      // onTokenRefresh seems to have lots of problems, just get the token on startup every time and update it
      //firebase.messaging().onTokenRefresh(token => updateUserFCMToken(this.props.userID, token));
      firebase.messaging().getToken().then(token => {
        updateUserFCMToken(this.props.userID, token);
      });
    }
  }
  async autoSignIn() {
    var url = 'https://us-central1-getplayd.cloudfunctions.net/signUpUser'
    const promiseAxios = await axios.get(url, {
      params: {
        phone: this.props.phoneNumber,
        countryCode:'+' + this.props.countryCode,
        giftAmount: 0,
      },
    });

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
