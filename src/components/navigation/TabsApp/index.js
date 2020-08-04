import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Footer from './footer/index';
import VideoPlayerPage from '../../app/videoPlayerPage/index';
import MessageList from '../../app/elementsMessage/MessageList';
import Stream from './components/Stream';

import VideoLibraryPage from '../../app/videoLibraryPage';
import Session from './components/Session';

import LocalSession from './components/LocalSession';
import VideoLibrary from './components/VideoLibrary';

import colors from '../../style/colors';

import {openVideoPlayer} from '../../functions/videoManagement';

// const Tab = createMaterialTopTabNavigator();
const Tab = createBottomTabNavigator();

function TabsApp() {
  return (
    <Tab.Navigator
      lazy
      initialRouteName="Stream"
      keyboardHidesTabBar={false}
      tabBar={(props) => (
        <Footer
          {...props}
          colors={{active: colors.primary, inactive: colors.greyDark}}
        />
      )}>
      <Tab.Screen
        name="Stream"
        component={Stream}
        options={{
          pageStack: 'StreamPage',
          label: 'Teams',
          signInToPass: false,
          icon: {
            name: 'users',
            type: 'font',
            size: 22,
          },
        }}
      />

      <Tab.Screen
        name="LocalSession"
        component={LocalSession}
        options={{
          pageStack: 'LocalSession',
          icon: {
            name: 'video-camera',
            type: 'moon',
            size: 20,
          },
          cardStyle: {
            backgroundColor: 'transparent',
          },
        }}
        initialParams={{
          noNavigation: true,
          processVideo: (videoInfo) => {
            openVideoPlayer(videoInfo, true);
          },
        }}
      />

      <Tab.Screen
        name="VideoLibrary"
        component={VideoLibrary}
        options={{
          pageStack: 'VideoLibrary',
          label: 'Watch',
          signInToPass: false,
          icon: {
            name: 'tv',
            type: 'font',
            size: 22,
          },
        }}
      />

      <Tab.Screen
        name="Session"
        component={Session}
        options={{
          gestureEnabled: false,
          hideInFooter: true,
          cardStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />

      <Tab.Screen
        name="VideoPlayerPage"
        component={VideoPlayerPage}
        options={{
          gestureEnabled: false,
          hideInFooter: true,
          cardStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />

    </Tab.Navigator>
  );
}

export default TabsApp;
