import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Coaching from '../../../app/coachingTab/index';
import ProfilePage from '../../../app/elementsUser/elementsProfile/ProfilePage';
import Conversation from '../../../app/elementsMessage/Conversation';

const Stack = createStackNavigator();
const Stream = () => {
  return (
    <Stack.Navigator initialRouteName="Coaches" headerMode="none" mode="card">
      <Stack.Screen name="Coaches" component={Coaching} />
      <Stack.Screen name="ProfilePage" component={ProfilePage} />
      <Stack.Screen name="Conversation" component={Conversation} />
    </Stack.Navigator>
  );
};

export default Stream;
