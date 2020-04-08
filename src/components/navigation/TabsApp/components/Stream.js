import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import StreamPage from '../../../app/coachFlow/StreamPage/index';

const Stack = createStackNavigator();
const Stream = () => {
  return (
    <Stack.Navigator
      initialRouteName="StreamPage"
      headerMode="none"
      mode="modal">
      <Stack.Screen name="StreamPage" component={StreamPage} />
    </Stack.Navigator>
  );
};

export default Stream;
