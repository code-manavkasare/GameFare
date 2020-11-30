import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import TabsApp from '../TabsApp/index';

import ProfilePage from '../../app/elementsUser/elementsProfile/ProfilePage';
import Conversation from '../../app/elementsMessage/Conversation';
import Profile from './components/Profile';
import Webview from '../../layout/Views/Webview';
import Groups from '../../app/coachFlow/GroupsPage/index';
import SessionSettings from '../../app/TeamPage/components/SessionSettings';
import {SheetModal} from '../transitions/SheetModal';
import {marginTopApp, width} from '../../style/sizes';

const Stack = createStackNavigator();
const MainApp = () => {
  const ProfileSpec = SheetModal({
    top: marginTopApp + 25,
    gestureHeight: 1 / 3,
  });
  const ModalSpec = SheetModal({
    top: 0,
    ignoreBackgroundScale: true,
    gestureHeight: 1 / 3,
  });
  return (
    <Stack.Navigator
      initialRouteName="TabsApp"
      headerMode="none"
      screenOptions={{
        gestureResponseDistance: {
          horizontal: width,
        },
      }}>
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

      <Stack.Screen
        name="VideoLibrary"
        component={Profile}
        options={ProfileSpec}
      />
      <Stack.Screen name="Groups" component={Groups} />

      <Stack.Screen name="SessionSettings" component={SessionSettings} />
    </Stack.Navigator>
  );
};

export default MainApp;
