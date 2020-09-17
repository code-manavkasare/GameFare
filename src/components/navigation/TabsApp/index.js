import React from 'react';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import Footer from './footer/index';
import People from './components/People';

import Session from './components/Session';
import VideoLibrary from './components/VideoLibrary';

import colors from '../../style/colors';

const Tab = createMaterialTopTabNavigator();

function TabsApp() {
  return (
    <Tab.Navigator
      initialRouteName="VideoLibrary"
      keyboardHidesTabBar={false}
      tabBar={(props) => (
        <Footer
          {...props}
          onRef={(ref) => {
            this.footerRef = ref;
          }}
          colors={{active: colors.primary, inactive: colors.greyDark}}
        />
      )}>
      <Tab.Screen
        name="VideoLibrary"
        component={VideoLibrary}
        options={{
          pageStack: 'VideoLibrary',
          label: 'Library',
          signInToPass: false,
          icon: {
            name: 'tv',
            type: 'font',
            // alt name: 'television',
            // alt type: 'moon',
            size: 21,
          },
        }}
      />

      <Tab.Screen
        name="Session"
        component={Session}
        options={{
          icon: {
            name: 'video-camera',
            type: 'moon',
            size: 20,
          },
          cardStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />

      <Tab.Screen
        name="People"
        component={People}
        options={{
          pageStack: 'GroupsPage',
          label: 'Call',
          signInToPass: false,
          icon: {
            name: 'video',
            type: 'font',
            // alt name: 'user',
            // alt type: 'moon',
            size: 21,
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default TabsApp;
