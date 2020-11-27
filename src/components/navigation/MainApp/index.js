import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import TabsApp from '../TabsApp/index';

import ProfilePage from '../../app/elementsUser/elementsProfile/ProfilePage';
import Conversation from '../../app/elementsMessage/Conversation';

import Profile from './components/Profile';

import Webview from '../../layout/Views/Webview';
import VideoPlayerPage from '../../app/videoPlayerPage/index';
import {DepthModal} from '../transitions/DepthModal';

import Groups from '../../app/coachFlow/GroupsPage/index';

import SessionSettings from '../../app/TeamPage/components/SessionSettings';

import sizes from '../../style/sizes';

const Stack = createStackNavigator();
const MainApp = () => {
  const ProfileSpec = DepthModal({top: sizes.marginTopApp + 25});
  const ModalSpec = DepthModal({top: 0, ignoreBackgroundScale: true});
  return (
    <Stack.Navigator initialRouteName="TabsApp" headerMode="none">
      <Stack.Screen
        name="TabsApp"
        component={TabsApp}
        options={{
          gestureEnabled: false,
          animationEnabled: false,
        }}
      />
      <Stack.Screen name="Conversation" component={Conversation} />

      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={ModalSpec}
      />

      <Stack.Screen name="Webview" component={Webview} />

      <Stack.Screen name="MorePage" component={Profile} options={ProfileSpec} />

      <Stack.Screen name="VideoPlayerPage" component={VideoPlayerPage} />
      <Stack.Screen name="Groups" component={Groups} />

      <Stack.Screen name="SessionSettings" component={SessionSettings} />
    </Stack.Navigator>
  );
};

export default MainApp;
