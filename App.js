import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import React, {Component} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {connect} from 'react-redux';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import Orientation from 'react-native-orientation-locker';
import BackgroundTimer from 'react-native-background-timer';
import convertToCache from 'react-native-video-cache';
import InitialStack from './src/components/navigation/index';
import Notification from './src/components/layout/alerts/Notification';
import UploadManager from './src/components/app/elementsUpload/UploadManager';

import {updateNotificationBadgeInBackground} from './src/components/functions/notifications.js';
import {userAction} from './src/actions/userActions';
import {globaleVariablesAction} from './src/actions/globaleVariablesActions.js';
import {refreshTokenOnDatabase} from './src/components/functions/notifications';
import {navigationRef} from './NavigationService';
import OrientationListener from './src/components/hoc/orientationListener';
import ConnectionTypeProvider from './src/components/utility/ConnectionTypeProvider';
import ArchiveBindManager from './src/components/utility/ArchiveBindManager';
import {
  updateLocalVideoUrls,
  oneTimeFixStoreLocalVideoLibrary,
} from './src/components/functions/videoManagement';

Orientation.lockToPortrait();

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
    BackgroundTimer.runBackgroundTimer(() => {
      userID && updateNotificationBadgeInBackground(userID); //Update badge every 15 min
    }, 900000);

    SplashScreen.hide();

    if (userID !== '') {
      this.autoSignIn();
      refreshTokenOnDatabase(userID);
      oneTimeFixStoreLocalVideoLibrary();
      updateLocalVideoUrls();
      convertToCache(''); // starts video cache server so cached url's work on startup
    }
  }

  componentDidUpdate = (prevProps) => {
    const {networkIsConnected, userID, isBindToFirebase} = this.props;

    if (!__DEV__) {
      this.configureSentry();
    }
    if (prevProps.networkIsConnected !== networkIsConnected) {
      if (networkIsConnected && userID !== '' && !isBindToFirebase) {
        this.autoSignIn();
        refreshTokenOnDatabase(userID);
      }
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
    const {
      countryCode,
      isBindToFirebase,
      networkIsConnected,
      phoneNumber,
      userID,
    } = this.props;
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

    if (!isBindToFirebase && networkIsConnected) {
      await this.props.globaleVariablesAction('setFirebaseBindingsState', {
        isBindToFirebase: true,
      });
    }

    return true;
  }

  render() {
    return (
      <NavigationContainer ref={navigationRef} theme={MyTheme}>
        {InitialStack()}
        <OrientationListener />
        <Notification />
        <UploadManager />
        <ConnectionTypeProvider />
        <ArchiveBindManager />
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
    networkIsConnected: state.network.isConnected,
  };
};

export default connect(
  mapStateToProps,
  {userAction, globaleVariablesAction},
)(App);
