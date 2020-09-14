import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import People from '../../../app/coachFlow/PeoplePage/index';
import Search from '../../../app/coachFlow/PeoplePage/components/Search';

const Stack = createStackNavigator();
const Stream = () => {
  return (
    <Stack.Navigator initialRouteName="People" headerMode="none" mode="card">
      <Stack.Screen name="People" component={People} />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{
          gestureEnabled: false,
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default Stream;
