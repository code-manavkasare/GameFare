import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import SignInStack from './SignIn';
import Alert from '../../layout/alerts/Alert';
import {DepthModal} from '../transitions/DepthModal';

const StackParent = createStackNavigator();

function SignIn() {
  const AlertSpec = DepthModal({heightScale: 0});
  return (
    <StackParent.Navigator initialRouteName="SignIn" headerMode="none">
      <StackParent.Screen name="SignIn" component={SignInStack} />
      <StackParent.Screen
        name="Alert"
        component={Alert}
        options={{
          ...AlertSpec,
        }}
      />
    </StackParent.Navigator>
  );
}

export default SignIn;
