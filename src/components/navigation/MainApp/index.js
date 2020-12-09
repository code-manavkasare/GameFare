import * as React from 'react';
import {StatusBar} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import TabsApp from '../TabsApp/index';

import Profile from './components/Profile';
import Webview from '../../layout/Views/Webview';
import Groups from '../../app/coachFlow/GroupsPage/index';
import CreateClub from '../../app/clubsPage/components/CreateClub';
import ClubInvites from '../../app/clubsPage/components/ClubInvites';
import Club from '../MainApp/components/Club';
import {SheetModal} from '../transitions/SheetModal';
import {marginTopApp, width} from '../../style/sizes';
import CreatePost from '../../app/clubsPage/components/CreatePost';
import Bookings from './components/Bookings';

const Stack = createStackNavigator();
const MainApp = () => {
  const SheetModalSpec = SheetModal({
    top: marginTopApp + 25,
    gestureHeight: 1 / 3,
  });
  return (
    <Stack.Navigator
      initialRouteName="TabsApp"
      screenOptions={{
        gestureResponseDistance: {
          horizontal: width,
        },
        header: () => <StatusBar barStyle={'dark-content'} />,
      }}>
      <Stack.Screen
        name="TabsApp"
        component={TabsApp}
        options={{
          gestureEnabled: false,
          animationEnabled: false,
        }}
      />

      <Stack.Screen name="Webview" component={Webview} />

      <Stack.Screen
        name="VideoLibrary"
        component={Profile}
        options={SheetModalSpec}
      />
      <Stack.Screen name="Groups" component={Groups} />

      <Stack.Screen
        name="ClubInvites"
        component={ClubInvites}
        options={SheetModalSpec}
      />
      <Stack.Screen
        name="CreateClub"
        component={CreateClub}
        options={SheetModalSpec}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePost}
        options={SheetModalSpec}
      />

      <Stack.Screen name="Club" component={Club} options={SheetModalSpec} />
      <Stack.Screen
        name="Bookings"
        component={Bookings}
        options={SheetModalSpec}
      />
    </Stack.Navigator>
  );
};

export default MainApp;
