import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Group from '../../../app/GroupPage';

const Stack = createStackNavigator();
const JoinGroup = () => {
  return (
    <Stack.Navigator initialRouteName="Group" headerMode="none">
      <Stack.Screen name="Group" component={Group} />
    </Stack.Navigator>
  );
};

export default JoinGroup;
