import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import CreateEvent0 from '../../../app/elementsEventCreate/Page0';
import CreateEvent1 from '../../../app/elementsEventCreate/Page1';
import CreateEvent2 from '../../../app/elementsEventCreate/Page2';
import CreateEvent3 from '../../../app/elementsEventCreate/Page3';

const Stack = createStackNavigator();
const CreateEvent = () => {
  return (
    <Stack.Navigator initialRouteName="CreateEvent0" headerMode="none">
      <Stack.Screen name="CreateEvent0" component={CreateEvent0} />
      <Stack.Screen name="CreateEvent1" component={CreateEvent1} />
      <Stack.Screen name="CreateEvent2" component={CreateEvent2} />
      <Stack.Screen name="CreateEvent3" component={CreateEvent3} />
    </Stack.Navigator>
  );
};

export default CreateEvent;
