import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import OnBoarding from './components/OnBoarding';
import TabsApp from '../TabsApp/index';
import CreateGroup from './components/CreateGroup';
import CreateEvent from './components/CreateEvent';

import JoinEvent from './components/JoinEvent';
import JoinGroup from './components/JoinGroup';

import ProfilePage from '../../app/elementsUser/elementsProfile/ProfilePage';
import Conversation from '../../app/elementsMessage/Conversation';

import Profile from './components/Profile';

import Webview from '../../layout/Views/Webview';
import NotificationPage from '../../app/elementsUser/elementsProfile/NotificationPage';
import TeamPage from '../../app/TeamPage/index';
import VideoPlayerPage from '../../app/videoPlayerPage/index';

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
          animationEnabled: false,
        }}
      />

      <Stack.Screen name="CreateGroup0" component={CreateGroup} />
      <Stack.Screen name="CreateEvent1" component={CreateEvent} />
      <Stack.Screen name="Event" component={JoinEvent} />
      <Stack.Screen name="Group" component={JoinGroup} />

      <Stack.Screen name="Conversation" component={Conversation} />

      <Stack.Screen name="ProfilePage" component={ProfilePage} />

      <Stack.Screen name="Webview" component={Webview} />

      <Stack.Screen name="NotificationPage" component={NotificationPage} />
      <Stack.Screen name="TeamPage" component={TeamPage} />

      <Stack.Screen name="MorePage" component={Profile} />

      <Stack.Screen name="VideoPlayerPage" component={VideoPlayerPage} />
    </Stack.Navigator>
  );
};

export default MainApp;
