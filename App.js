import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation';
import StatusBar from '@react-native-community/status-bar';
import {connect} from 'react-redux';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';

import AppSwitchNavigator from './src/components/navigation/AppNavigator';
import NavigationService from './NavigationService';

import {globaleVariablesAction} from './src/actions/globaleVariablesActions';
import {userAction} from './src/actions/userActions';
import {refreshTokenOnDatabase} from './src/components/functions/notifications';

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
const AppContainer = createAppContainer(AppSwitchNavigator);

class App extends Component {
  async componentDidMount() {
    SplashScreen.hide();
    StatusBar.setHidden(true, 'slide');
    StatusBar.setBarStyle('light-content', true);
    if (this.props.userID !== '') {
      this.autoSignIn();
      refreshTokenOnDatabase(this.props.userID);
    }
  }

  async autoSignIn() {
    var url = 'https://us-central1-getplayd.cloudfunctions.net/signUpUser';
    const promiseAxios = await axios.get(url, {
      params: {
        phone: this.props.phoneNumber,
        countryCode: '+' + this.props.countryCode,
        giftAmount: 0,
      },
    });

    if (promiseAxios.data.response != false) {
      await this.props.userAction('signIn', {
        userID: this.props.userID,
        firebaseSignInToken: promiseAxios.data.firebaseSignInToken,
        phoneNumber: this.props.phoneNumber,
        countryCode: this.props.countryCode,
      });
    }
    return true;
  }

  render() {
    return (
      <AppContainer
        ref={(navigatorRef) => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userIDSaved,
    phoneNumber: state.user.phoneNumber,
    countryCode: state.user.countryCode,
  };
};

export default connect(mapStateToProps, {globaleVariablesAction, userAction})(
  App,
);
