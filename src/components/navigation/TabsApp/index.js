import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Footer from './footer/index';

import Activity from '../../app/elementsActivity/Activity';
import HomePage from '../../app/HomePage';
import MessageList from '../../app/elementsMessage/MessageList';
import StreamPage from '../../app/coachFlow/StreamPage/index';

import colors from '../../style/colors';

const Tab = createBottomTabNavigator();

function TabsApp() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      keyboardHidesTabBar={false}
      tabBarOptions={{
        style: {
          height: 100,
          backgroundColor: 'red',
        },
      }}
      tabBar={(props) => (
        <Footer
          {...props}
          colors={{active: colors.primary, inactive: colors.greyDark}}
        />
      )}>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          label: 'Home',
          signInToPass: false,
          icon: {
            name: 'searchFooter',
            type: 'moon',
          },
        }}
      />
      <Tab.Screen
        name="Activity"
        component={Activity}
        options={{
          label: 'Activity',
          signInToPass: false,
          icon: {
            name: 'calendar2',
            type: 'moon',
          },
        }}
      />
      <Tab.Screen
        name="StartCoaching"
        component={StreamPage}
        options={{
          label: 'Stream',
          signInToPass: false,
          icon: {
            name: 'calendar2',
            type: 'moon',
          },
        }}
      />
      <Tab.Screen
        name="MessageList"
        component={MessageList}
        options={{
          label: 'Message',
          signInToPass: false,
          icon: {
            name: 'speech',
            type: 'moon',
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Activity}
        options={{
          label: 'Profile',
          signInToPass: true,
          icon: {
            name: 'profileFooter',
            type: 'moon',
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default TabsApp;
