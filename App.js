import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import React, {Component} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import BackgroundTimer from 'react-native-background-timer';
import {Text, StatusBar, LogBox, Linking} from 'react-native';

import {store} from './src/store/reduxStore';

import InitialStack from './src/components/navigation/index';
import Notification from './src/components/layout/alerts/Notification';
import UploadManager from './src/components/app/elementsUpload/UploadManager';
import AppState from './src/components/app/functional/AppState.js';
import {updateNotificationBadgeInBackground} from './src/components/functions/notifications.js';
import {signIn} from './src/store/actions/userActions';
import {clickNotification, navigationRef} from './NavigationService';
import OrientationListener from './src/components/hoc/orientationListener';
import ConnectionTypeProvider from './src/components/utility/ConnectionTypeProvider';

import BranchManager from './src/components/utility/BranchManager';
import CallListener from './src/components/utility/CallListener';
import {audioDebugger} from './src/components/utility/AudioSessionDebugger';
import {logsBridgeRN} from './src/components/functions/logs';
import messaging from '@react-native-firebase/messaging';

import {
  updateLocalVideoUrls,
  oneTimeFixStoreLocalVideoLibrary,
} from './src/components/functions/videoManagement';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

// if (__DEV__) logsBridgeRN();

export default class App extends Component {
  constructor() {
    super();
    if (Text.defaultProps == null) Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
  }
  async componentDidMount() {
    const {userID} = store.getState().user;
    if (!__DEV__) {
      this.configureSentry();
    }
    BackgroundTimer.runBackgroundTimer(() => {
      userID && updateNotificationBadgeInBackground(userID); //Update badge every 15 min
    }, 900000);

    if (userID !== '') {
      this.autoSignIn();
      await oneTimeFixStoreLocalVideoLibrary();
      await updateLocalVideoUrls();
    }

    //Console log the audio session
    audioDebugger({interval: 5000, disabled: true});
    StatusBar.setBarStyle('dark-content', true);
    StatusBar.setHidden(false);

    LogBox.ignoreLogs([
      "Accessing the 'state' property of the 'route' object is not supported.",
    ]);

    SplashScreen.hide();
  }

  configureSentry = () => {
    Sentry.init({
      dsn: 'https://edb7dcfee75b46ad9ad45bc0193f6c0d@sentry.io/2469968',
      enableAutoSessionTracking: true,
      attachStacktrace: true,
      environment: Config.ENV,
      release: `${DeviceInfo.getBundleId()}@${DeviceInfo.getVersion()}+${DeviceInfo.getBuildNumber()}`,
    });
    const {userConnected, infoUser, userID} = store.getState().user;
    Sentry.configureScope((scope) => {
      if (userConnected) {
        const {userInfo} = infoUser;
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
    const {userID, phoneNumber, countryCode} = store.getState().user;
    var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}signUpUser`;

    const {data} = await axios.get(url, {
      params: {
        phone: phoneNumber,
        countryCode: '+' + countryCode,
        giftAmount: 0,
      },
    });

    if (data.response !== false) {
      await signIn({
        userID: userID,
        firebaseSignInToken: data.firebaseSignInToken,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
      });
    }

    const notificationOpen = await messaging().getInitialNotification();
    if (notificationOpen) {
      return clickNotification(notificationOpen);
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
