import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Dimensions, View} from 'react-native';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import Loader from '../../../layout/loaders/Loader';

import ListGroups from '../../../app/coachFlow/GroupsPage/components/ListGroups';
import ListGroupsRequests from '../../../app/coachFlow/GroupsPage/components/ListGroupsRequests';

const Tab = createMaterialTopTabNavigator();

const initialLayout = {width: Dimensions.get('window').width};

const MyTabs = ({tabBarVisible, numberSesionRequests, AnimatedHeaderValue}) => {
  return (
    <Tab.Navigator
      initialRouteName="Messages"
      lazy={true}
      swipeEnabled={tabBarVisible}
      lazyPlaceholder={() => (
        <View style={[styleApp.stylePage, styleApp.center]}>
          <Loader size={40} color={colors.primary} />
        </View>
      )}
      initialLayout={initialLayout}
      sceneContainerStyle={{backgroundColor: colors.white}}
      tabBarOptions={{
        activeTintColor: colors.primary,
        inactiveTintColor: colors.greyDark,
        pressColor: colors.primary,
        labelStyle: {...styleApp.titleNoColor, fontSize: 12},
        style: {backgroundColor: colors.white, height: 50, marginTop: 35},
        indicatorStyle: {backgroundColor: colors.primary},
        scrollEnabled: false,
        showIcon: false,
        iconStyle: {position: 'absolute'},
      }}>
      <Tab.Screen
        options={{
          tabBarLabel: 'Messages',
        }}
        name="Messages">
        {() => <ListGroups AnimatedHeaderValue={AnimatedHeaderValue} />}
      </Tab.Screen>

      <Tab.Screen
        options={{
          tabBarLabel: `Requests (${numberSesionRequests})`,
        }}
        name="Requests">
        {() => <ListGroupsRequests AnimatedHeaderValue={AnimatedHeaderValue} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MyTabs;
