import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Footer from './footer/index';

import MessageList from '../../app/elementsMessage/MessageList';
import Stream from './components/Stream';
import Profile from './components/Profile';

import colors from '../../style/colors';

const Tab = createBottomTabNavigator();

function TabsApp() {
  console.log('tabs app');
  return (
    <Tab.Navigator
      initialRouteName="Profile"
      keyboardHidesTabBar={false}
      tabBar={(props) => (
        <Footer
          {...props}
          colors={{active: colors.white, inactive: colors.greyDark}}
        />
      )}>
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
    </Tab.Navigator>
  );
}

export default TabsApp;
