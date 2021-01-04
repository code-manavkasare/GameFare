import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import VideoLibraryPage from '../../../app/videoLibraryPage';
import Wallet from '../../../app/elementsUser/elementsProfile/Wallet';
import BlockedUsersList from '../../../app/elementsUser/elementsProfile/BlockedUsersList';
import MorePage from '../../../app/MorePage';
import EditProfilePage from '../../../app/elementsUser/elementsProfile/EditProfilePage';
import AppSettings from '../../../app/elementsUser/elementsProfile/AppSettings';
import NotificationPage from '../../../app/elementsUser/elementsProfile/NotificationPage';

import {width} from '../../../style/sizes';

const Stack = createStackNavigator();
const OnBoarding = () => {
  return (
    <Stack.Navigator
      initialRouteName="VideoLibrary"
      headerMode="none"
      screenOptions={{
        gestureResponseDistance: {
          horizontal: width,
        },
      }}>
      <Stack.Screen name="VideoLibrary" component={VideoLibraryPage} />
      <Stack.Screen name="MorePage" component={MorePage} />
      <Stack.Screen name="Wallet" component={Wallet} />

      <Stack.Screen name="BlockedUsersList" component={BlockedUsersList} />
      <Stack.Screen name="EditProfilePage" component={EditProfilePage} />
      <Stack.Screen name="AppSettings" component={AppSettings} />

      <Stack.Screen name="NotificationPage" component={NotificationPage} />
    </Stack.Navigator>
  );
};

export default OnBoarding;
