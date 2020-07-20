import 'react-native-gesture-handler';

import React, {Component} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';

import {connect} from 'react-redux';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import InitialStack from './src/components/navigation/index';
import Notification from './src/components/layout/alerts/Notification';
import UploadManager from './src/components/app/elementsUpload/UploadManager';

import {userAction} from './src/actions/userActions';
import {refreshTokenOnDatabase} from './src/components/functions/notifications';
import {navigationRef} from './NavigationService';
import OrientationListener from './src/components/hoc/orientationListener';
import BatterySaveDimmer from './src/components/utility/BatterySaveDimmer';

import * as Sentry from '@sentry/react-native';

import Orientation from 'react-native-orientation-locker';
Orientation.lockToPortrait();

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

class App extends Component {
  async componentDidMount() {
    const {userID} = this.props;
    if (!__DEV__) {
      this.configureSentry();
    }
    SplashScreen.hide();
    if (userID !== '') {
      this.autoSignIn();
      refreshTokenOnDatabase(userID);
    }
  }

  componentDidUpdate = () => {
    if (!__DEV__) {
      this.configureSentry();
    }
  };

  configureSentry = () => {
    Sentry.init({
      dsn: 'https://edb7dcfee75b46ad9ad45bc0193f6c0d@sentry.io/2469968',
      enableAutoSessionTracking: true,
      attachStacktrace: true,
      environment: Config.ENV,
    });
    Sentry.configureScope((scope) => {
      if (this.props.userConnected) {
        const {userInfo, userID} = this.props;
        scope.setUser({
          username: `${userInfo.firstname} ${userInfo.lastname}`,
          id: userID,
        });
      } else {
        scope.setUser({username: 'notConnected'});
      }
    });
    Sentry.setDist(DeviceInfo.getBuildNumber());
    Sentry.setRelease(`${DeviceInfo.getBundleId()}-${DeviceInfo.getVersion()}`);
  };

  async autoSignIn() {
    var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}signUpUser`;
    const promiseAxios = await axios.get(url, {
      params: {
        phone: this.props.phoneNumber,
        countryCode: '+' + this.props.countryCode,
        giftAmount: 0,
      },
    });

    if (promiseAxios.data.response !== false) {
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
      <NavigationContainer ref={navigationRef} theme={MyTheme}>
        {InitialStack()}
        {/* <BatterySaveDimmer /> */}
        <OrientationListener />
        <Notification />
        <UploadManager />
      </NavigationContainer>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userConnected: state.user.userConnected,
    userInfo: state.user.infoUser.userInfo,
    userID: state.user.userIDSaved,
    phoneNumber: state.user.phoneNumber,
    countryCode: state.user.countryCode,
  };
};

export default connect(
  mapStateToProps,
  {userAction},
)(App);
