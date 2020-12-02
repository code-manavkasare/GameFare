import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {width} from '../../../style/sizes';
import ClubSettings from '../../../app/clubSettings/index';
import CreateService from '../../../app/clubSettings/components/CreateService';

const Stack = createStackNavigator();
const OnBoarding = () => {
  return (
    <Stack.Navigator
      initialRouteName="ClubSettings"
      headerMode="none"
      screenOptions={{
        gestureResponseDistance: {
          horizontal: width,
        },
      }}>
      <Stack.Screen name="ClubSettings" component={ClubSettings} />
      <Stack.Screen name="CreateService" component={CreateService} />
    </Stack.Navigator>
  );
};

export default OnBoarding;
