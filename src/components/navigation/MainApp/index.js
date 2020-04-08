import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import OnBoarding from './components/OnBoarding';
import TabsApp from '../TabsApp/index';
import CreateChallenge from './components/CreateChallenge';
import JoinChallenge from './components/JoinChallenge';
import CreateGroup from './components/CreateGroup';
import CreateEvent from './components/CreateEvent';

import JoinEvent from './components/JoinEvent';
import JoinGroup from './components/JoinGroup';

import ProfilePage from '../../app/elementsUser/elementsProfile/ProfilePage';

import Conversation from '../../app/elementsMessage/Conversation';

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
      <Stack.Screen name="CreateChallenge" component={CreateChallenge} />
      <Stack.Screen name="Challenge" component={JoinChallenge} />

      <Stack.Screen name="CreateGroup0" component={CreateGroup} />
      <Stack.Screen name="CreateEvent1" component={CreateEvent} />
      <Stack.Screen name="Event" component={JoinEvent} />
      <Stack.Screen name="Group" component={JoinGroup} />

      <Stack.Screen name="Conversation" component={Conversation} />

      <Stack.Screen name="ProfilePage" component={ProfilePage} />
      
    </Stack.Navigator>
  );
};

export default MainApp;
