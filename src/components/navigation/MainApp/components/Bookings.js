import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {width} from '../../../style/sizes';
import BookingsPage from '../../../app/bookingsPage/index';
import BookingCompletion from '../../../app/bookService/components/BookingCompletion';

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
      <Stack.Screen name="BookingCompletion" component={BookingCompletion} />
    </Stack.Navigator>
  );
};

export default Bookings;
