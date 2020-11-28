import React from 'react';
import isEqual from 'lodash.isequal';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import Footer from './footer/index';
import CallTabPage from '../../app/callTab';
import Session from './components/Session';
import Clubs from './components/Clubs';

import colors from '../../style/colors';

const Tab = createMaterialTopTabNavigator();

class TabsApp extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (isEqual(this.props, nextProps)) {
      return false;
    }
    return true;
  }
  render = () => {
    return (
      <Tab.Navigator
        initialRouteName="VideoLibrary"
        keyboardHidesTabBar={false}
        lazy={true}
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
          name="Clubs"
          options={{
            pageStack: 'Clubs',
            label: 'Library',
            signInToPass: false,
            icon: {
              name: 'film',
              type: 'font',

              size: 23,
            },
          }}
          component={Clubs}
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
          name="CallTab"
          component={CallTabPage}
          options={{
            pageStack: 'GroupsPage',
            label: 'Calls',
            displayPastille: true,
            signInToPass: false,
            icon: {
              name: 'video',
              type: 'font',
              size: 23,
            },
          }}
        />
      </Tab.Navigator>
    );
  };
}

export default TabsApp;
