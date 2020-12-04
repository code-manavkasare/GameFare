import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {width} from '../../../style/sizes';
import ClubSettings from '../../../app/clubSettings/index';
import CreateService from '../../../app/clubSettings/components/CreateService';
import BookService from '../../../app/bookService/index';
import BookingSummary from '../../../app/bookService/components/BookingSummary';

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
      <Stack.Screen name="BookService" component={BookService} />
      <Stack.Screen name="BookingSummary" component={BookingSummary} />
    </Stack.Navigator>
  );
};

export default OnBoarding;
