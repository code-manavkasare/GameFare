import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {width} from '../../../style/sizes';
import BookingsPage from '../../../app/bookingsPage/index';

const Stack = createStackNavigator();
const Bookings = () => {
  return (
    <Stack.Navigator
      initialRouteName="Bookings"
      headerMode="none"
      screenOptions={{
        gestureResponseDistance: {
          horizontal: width,
        },
      }}>
      <Stack.Screen name="Bookings" component={BookingsPage} />
    </Stack.Navigator>
  );
};

export default Bookings;
