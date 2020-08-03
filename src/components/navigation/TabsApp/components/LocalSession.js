import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Camera from '../../../app/camera/Camera';

const Stack = createStackNavigator();
const LocalSession = () => {
  return (
    <Stack.Navigator initialRouteName="RecordLocalSession" headerMode="none">
      <Stack.Screen name="RecordLocalSession" component={Camera} />
    </Stack.Navigator>
  );
};

export default LocalSession;