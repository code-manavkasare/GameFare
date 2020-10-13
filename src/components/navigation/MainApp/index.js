import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import TabsApp from '../TabsApp/index';

import ProfilePage from '../../app/elementsUser/elementsProfile/ProfilePage';
import Conversation from '../../app/elementsMessage/Conversation';

import Profile from './components/Profile';

import Webview from '../../layout/Views/Webview';
import TeamPage from '../../app/TeamPage/index';
import VideoPlayerPage from '../../app/videoPlayerPage/index';
import SelectVideosFromLibrary from '../../app/videoLibraryPage/index';

import Groups from '../../app/coachFlow/GroupsPage/index';

import SessionSettings from '../../app/TeamPage/components/SessionSettings';

import initialPage from '../../app/initialPage';

const Stack = createStackNavigator();
const MainApp = () => {
  return (
    <Stack.Navigator initialRouteName="TabsApp" headerMode="none">
      <Stack.Screen name="InitialPage" component={initialPage} />
      <Stack.Screen
        name="TabsApp"
        component={TabsApp}
        options={{
          gestureEnabled: false,
          animationEnabled: false,
        }}
      />
      <Stack.Screen name="Conversation" component={Conversation} />

      <Stack.Screen name="ProfilePage" component={ProfilePage} />

      <Stack.Screen name="Webview" component={Webview} />

      <Stack.Screen name="TeamPage" component={TeamPage} />

      <Stack.Screen name="MorePage" component={Profile} />

      <Stack.Screen name="VideoPlayerPage" component={VideoPlayerPage} />
      <Stack.Screen name="Groups" component={Groups} />

      <Stack.Screen
        name="SelectVideosFromLibrary"
        component={SelectVideosFromLibrary}
      />

      <Stack.Screen name="SessionSettings" component={SessionSettings} />
    </Stack.Navigator>
  );
};

export default MainApp;
