import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import CreateGroup0 from '../../../app/elementsGroupCreate/Page0';

const Stack = createStackNavigator();
const CreateGroup = () => {
  return (
    <Stack.Navigator initialRouteName="CreateGroup1" headerMode="none">
      <Stack.Screen name="CreateGroup1" component={CreateGroup0} />
    </Stack.Navigator>
  );
};

export default CreateGroup;
