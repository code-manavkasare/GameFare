import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import OnBoarding from './components/OnBoarding';
import TabsApp from '../TabsApp/index';

const Stack = createStackNavigator();
const MainApp = () => {
  return (
    <Stack.Navigator initialRouteName="InitialPage" headerMode="none">
      <Stack.Screen name="InitialPage" component={OnBoarding} />
      <Stack.Screen
        name="TabsApp"
        component={TabsApp}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainApp;
