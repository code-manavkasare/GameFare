import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import Phone from '../../login/Phone';
import Verify from '../../login/Verify';
import Complete from '../../login/Complete';

const StackSignin = createStackNavigator();
function SignIn() {
  return (
    <StackSignin.Navigator initialRouteName="InitialPage" headerMode="none">
      <StackSignin.Screen name="Phone" component={Phone} />
      <StackSignin.Screen name="Verify" component={Verify} />
      <StackSignin.Screen name="Complete" component={Complete} />
    </StackSignin.Navigator>
  );
}

export default SignIn;
