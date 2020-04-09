import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Wallet from '../../../app/elementsUser/elementsProfile/Wallet';
import BlockedUsersList from '../../../app/elementsUser/elementsProfile/BlockedUsersList';
import Settings from '../../../app/elementsUser/elementsProfile/Settings';
import MorePage from '../../../app/MorePage';
import EditProfilePage from '../../../app/elementsUser/elementsProfile/EditProfilePage';

const Stack = createStackNavigator();
const OnBoarding = () => {
  return (
    <Stack.Navigator initialRouteName="MorePage" headerMode="none">
      <Stack.Screen name="MorePage" component={MorePage} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="BlockedUsersList" component={BlockedUsersList} />
      <Stack.Screen name="EditProfilePage" component={EditProfilePage} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
};

export default OnBoarding;
