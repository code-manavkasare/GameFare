import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import {Integrations as TracingIntegrations} from '@sentry/tracing';
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
import {Text} from 'react-native';

import InitialStack from './src/components/navigation/index';
import Notification from './src/components/layout/alerts/Notification';
import UploadManager from './src/components/app/elementsUpload/UploadManager';
import AppState from './src/components/app/functional/AppState.js';
import {updateNotificationBadgeInBackground} from './src/components/functions/notifications.js';
import {regenerateThumbnail} from './src/components/functions/videoManagement.js';
import {userAction} from './src/actions/userActions';
import {globaleVariablesAction} from './src/actions/globaleVariablesActions.js';
import {appSettingsAction} from './src/actions/appSettingsActions.js';
import {refreshTokenOnDatabase} from './src/components/functions/notifications';
import {navigationRef} from './NavigationService';
import OrientationListener from './src/components/hoc/orientationListener';
import ConnectionTypeProvider from './src/components/utility/ConnectionTypeProvider';

import BranchManager from './src/components/utility/BranchManager';
import CallListener from './src/components/utility/CallListener';
import {audioDebugger} from './src/components/utility/AudioSessionDebugger';

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
  constructor() {
    super();
    if (Text.defaultProps == null) Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
  }
  async componentDidMount() {
    const {archives, appSettingsAction, buildId, userID} = this.props;
    if (!__DEV__) {
      this.configureSentry();
    }
    BackgroundTimer.runBackgroundTimer(() => {
      userID && updateNotificationBadgeInBackground(userID); //Update badge every 15 min
    }, 900000);

    const actualBuildId = await DeviceInfo.getBuildId();
    if (buildId !== actualBuildId) {
      for (const archive of Object.values(archives)) {
        if (archive.local) {
          // regenerateThumbnail(archive);
        }
      }
      appSettingsAction('setCurrentBuildNumber', actualBuildId);
    }

    SplashScreen.hide();

    if (userID !== '') {
      this.autoSignIn();
      refreshTokenOnDatabase(userID);
      oneTimeFixStoreLocalVideoLibrary();
      updateLocalVideoUrls();
      convertToCache(''); // starts video cache server so cached url's work on startup
    }

    //Console log the audio session
    audioDebugger({interval: 5000, disabled: true});
  }

  componentDidUpdate = async (prevProps) => {
    const {networkIsConnected, userID, isBindToFirebase} = this.props;
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
      release: `${DeviceInfo.getBundleId()}@${DeviceInfo.getVersion()}+${DeviceInfo.getBuildNumber()}`,
      // integrations: [new TracingIntegrations.BrowserTracing()],
      // tracesSampleRate: 0.2,
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
        <AppState />
        {InitialStack()}
        <OrientationListener />
        <Notification />
        <UploadManager />
        <ConnectionTypeProvider />

        <BranchManager />
        <CallListener />
      </NavigationContainer>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    archives: state.archives,
    isBindToFirebase: state.globaleVariables.isBindToFirebase,
    userConnected: state.user.userConnected,
    userInfo: state.user.infoUser.userInfo,
    userID: state.user.userIDSaved,
    phoneNumber: state.user.phoneNumber,
    countryCode: state.user.countryCode,
    networkIsConnected: state.network.isConnected,
    buildId: state.appSettings.buildId,
  };
};

export default connect(
  mapStateToProps,
  {appSettingsAction, userAction, globaleVariablesAction},
)(App);
