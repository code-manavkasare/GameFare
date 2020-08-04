import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import CameraPage from '../../../app/camera';

const Stack = createStackNavigator();
const LocalSession = () => {
  return (
    <Stack.Navigator initialRouteName="RecordLocalSession" headerMode="none">
      <Stack.Screen name="RecordLocalSession" component={CameraPage} />
    </Stack.Navigator>
  );
};

export default LocalSession;