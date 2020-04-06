import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Checkout from '../../../app/elementsJoining/Checkout';
import EventPage from '../../../app/EventPage';

const Stack = createStackNavigator();
const JoinEvent = () => {
  return (
    <Stack.Navigator initialRouteName="Event" headerMode="none">
      <Stack.Screen name="Event" component={EventPage} />
      <Stack.Screen name="Checkout" component={Checkout} />
    </Stack.Navigator>
  );
};

export default JoinEvent;
