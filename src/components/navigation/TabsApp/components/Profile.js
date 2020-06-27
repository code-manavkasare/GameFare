import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import VideoLibraryPage from '../../../app/videoLibraryPage';
import Wallet from '../../../app/elementsUser/elementsProfile/Wallet';
import BlockedUsersList from '../../../app/elementsUser/elementsProfile/BlockedUsersList';
import MorePage from '../../../app/MorePage';
import EditProfilePage from '../../../app/elementsUser/elementsProfile/EditProfilePage';
import AppSettings from '../../../app/elementsUser/elementsProfile/AppSettings';

const Stack = createStackNavigator();
const OnBoarding = () => {
  return (
    <Stack.Navigator initialRouteName="MorePage" headerMode="none">
      <Stack.Screen name="MorePage" component={MorePage} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="VideoLibraryPage" component={VideoLibraryPage} />
      <Stack.Screen name="BlockedUsersList" component={BlockedUsersList} />
      <Stack.Screen name="EditProfilePage" component={EditProfilePage} />
      <Stack.Screen name="AppSettings" component={AppSettings} />
    </Stack.Navigator>
  );
};

export default OnBoarding;
