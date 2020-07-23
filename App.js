import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import React, {Component} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import {connect} from 'react-redux';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import Orientation from 'react-native-orientation-locker';

import InitialStack from './src/components/navigation/index';
import Notification from './src/components/layout/alerts/Notification';
import UploadManager from './src/components/app/elementsUpload/UploadManager';

import {userAction} from './src/actions/userActions';
import {globaleVariablesAction} from './src/actions/globaleVariablesActions.js';
import {refreshTokenOnDatabase} from './src/components/functions/notifications';
import {navigationRef} from './NavigationService';
import OrientationListener from './src/components/hoc/orientationListener';
import BatterySaveDimmer from './src/components/utility/BatterySaveDimmer';

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
    const {isBindToFirebase, userID} = this.props;
    if (!__DEV__) {
      this.configureSentry();
    }

    if (userID !== '') {
      await this.autoSignIn();
      await refreshTokenOnDatabase(userID);
    }

    NetInfo.addEventListener((state) => {
      if (state.isConnected && userID !== '' && isBindToFirebase) {
        this.autoSignIn();
        refreshTokenOnDatabase(userID);
      }
    });
    SplashScreen.hide();
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
    const {countryCode, isBindToFirebase, phoneNumber, userID} = this.props;
    var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}signUpUser`;

    const promiseAxios = await axios.get(url, {
      params: {
        phone: phoneNumber,
        countryCode: '+' + countryCode,
        giftAmount: 0,
      },
    });

    if (promiseAxios.data.response !== false) {
      await this.props.userAction('signIn', {
        userID: userID,
        firebaseSignInToken: promiseAxios.data.firebaseSignInToken,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
      });
    }

    if (!isBindToFirebase)
      await NetInfo.fetch().then(async (state) => {
        if (state.isConnected) {
          console.log('setStore to false');
          await this.props.globaleVariablesAction('setFirebaseBindingsState', {
            isBindToFirebase: true,
          });
        }
      });
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
    isBindToFirebase: state.globaleVariables.isBindToFirebase,
    userConnected: state.user.userConnected,
    userInfo: state.user.infoUser.userInfo,
    userID: state.user.userIDSaved,
    phoneNumber: state.user.phoneNumber,
    countryCode: state.user.countryCode,
  };
};

export default connect(
  mapStateToProps,
  {userAction, globaleVariablesAction},
)(App);
