import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Alert from '../../../layout/alerts/Alert';
import AlertAddress from '../../../layout/alerts/AlertAddress';
import AlertCall from '../../../layout/alerts/AlertCall';
import AlertAddImage from '../../../layout/alerts/AlertAddImage';
import AlertAddUsers from '../../../layout/alerts/AlertAddUsers';
import AlertYesNo from '../../../layout/alerts/AlertYesNo';

const Stack = createStackNavigator();
const Alerts = () => {
  return (
    <Stack.Navigator
      initialRouteName="Alert"
      headerMode="none"
      options={{cardStyle: {backgroundColor: 'transparent'}}}>
      <Stack.Screen
        name="Alert"
        component={Alert}
        options={{cardStyle: {backgroundColor: 'transparent'}}}
      />
      <Stack.Screen name="AlertAddress" component={AlertAddress} />
      <Stack.Screen name="AlertCall" component={AlertCall} />
      <Stack.Screen name="AlertAddImage" component={AlertAddImage} />
      <Stack.Screen name="AlertAddUsers" component={AlertAddUsers} />
      <Stack.Screen name="AlertYesNo" component={AlertYesNo} />
    </Stack.Navigator>
  );
};

export default Alerts;
