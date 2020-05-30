import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import StreamPage from '../../../app/coachFlow/StreamPage/index';
import Settings from '../../../app/coachFlow/StreamPage/components/StreamView/components/Settings';

const Stack = createStackNavigator();
const Stream = () => {
  return (
    <Stack.Navigator
      initialRouteName="StreamPage"
      headerMode="none"
      mode="card">
      <Stack.Screen name="StreamPage" component={StreamPage} />
      <Stack.Screen name="Settings" component={Settings} options={{
          gestureEnabled: false,
        }}/>
    </Stack.Navigator>
  );
};

export default Stream;
