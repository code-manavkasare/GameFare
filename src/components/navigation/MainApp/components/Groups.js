import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Groups from '../../app/coachFlow/GroupsPage/index';

const Stack = createStackNavigator();
const Stream = () => {
  return (
    <Stack.Navigator initialRouteName="Groups" headerMode="none" mode="card">
      <Stack.Screen name="Groups" component={Groups} />
    </Stack.Navigator>
  );
};

export default Stream;
