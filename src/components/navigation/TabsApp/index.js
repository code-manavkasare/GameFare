import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Footer from './footer/index';

import MessageList from '../../app/elementsMessage/MessageList';
import Stream from './components/Stream';
import Session from './components/Session';
import Profile from './components/Profile';

import colors from '../../style/colors';

const Tab = createBottomTabNavigator();

function TabsApp() {
  return (
    <Tab.Navigator
      initialRouteName="Stream"
      keyboardHidesTabBar={false}
      tabBar={(props) => (
        <Footer
          {...props}
          colors={{active: colors.white, inactive: colors.greyDark}}
        />
      )}>
      <Tab.Screen
        name="Stream"
        component={Stream}
        options={{
          pageStack: 'StreamPage',
          label: 'Stream',
          signInToPass: false,
          icon: {
            name: 'video-camera',
            type: 'moon',
            size: 21,
          },
        }}
      />

      <Tab.Screen
        name="MessageList"
        component={MessageList}
        options={{
          displayPastille: true,
          label: 'Message',
          pageStack: 'MessageList',
          signInToPass: false,
          icon: {
            name: 'speech',
            type: 'moon',
            size: 21,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          label: 'Profile',
          pageStack: 'MorePage',
          signInToPass: false,
          icon: {
            name: 'profileFooter',
            type: 'moon',
            size: 21,
          },
        }}
      />
      <Tab.Screen
        name="Session"
        component={Session}
        options={{
          pageStack: 'Session',
          label: 'Session',
        }}
      />
    </Tab.Navigator>
  );
}

export default TabsApp;
