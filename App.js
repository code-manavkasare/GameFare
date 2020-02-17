import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation';
import StatusBar from '@react-native-community/status-bar';
import {connect} from 'react-redux';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

import AppSwitchNavigator from './src/components/navigation/AppNavigator';
import NavigationService from './NavigationService';

import {globaleVariablesAction} from './src/actions/globaleVariablesActions';
import {userAction} from './src/actions/userActions';
import {refreshTokenOnDatabase} from './src/components/functions/notifications';

import * as Sentry from '@sentry/react-native';

const configureSentry = () => {
  Sentry.init({
    dsn: 'https://edb7dcfee75b46ad9ad45bc0193f6c0d@sentry.io/2469968',
    attachStacktrace: true,
  });
  Sentry.setDist(DeviceInfo.getBuildNumber());
  Sentry.setRelease(`${DeviceInfo.getBundleId()}-${DeviceInfo.getVersion()}`);
};

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
const AppContainer = createAppContainer(AppSwitchNavigator);

class App extends Component {
  async componentDidMount() {
    configureSentry();
    SplashScreen.hide();
    StatusBar.setHidden(true, 'slide');
    StatusBar.setBarStyle('light-content', true);
    if (this.props.userID !== '') {
      this.autoSignIn();
      refreshTokenOnDatabase(this.props.userID);
    }
  }

  async autoSignIn() {
    var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}signUpUser`;
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
