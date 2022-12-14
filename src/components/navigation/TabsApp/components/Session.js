import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Session from '../../../app/coachFlow/GroupsPage/components/StreamView/index';
import FinalizeRecording from '../../../app/coachFlow/GroupsPage/components/StreamView/footer/components/FinalizeRecording/index';
import Settings from '../../../app/coachFlow/GroupsPage/components/StreamView/components/Settings';

const Stack = createStackNavigator();
const Stream = () => {
  return (
    <Stack.Navigator initialRouteName="Session" headerMode="none" mode="card">
      <Stack.Screen name="Session" component={Session} />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default Stream;
