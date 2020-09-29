import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Dimensions, View, TouchableOpacity, Animated} from 'react-native';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import Loader from '../../../layout/loaders/Loader';

import ListMessages from '../../../app/elementsMessage/ListMessages';
import {
  ListContents,
  ListPlayers,
} from '../../../app/TeamPage/components/elements';

import AllIcon from '../../../layout/icons/AllIcons';

const Tab = createMaterialTopTabNavigator();

const initialLayout = {width: Dimensions.get('window').width};

const MyTabs = ({session, user, initialMessage, messages}) => {
  const {objectID} = session;
  return (
    <Tab.Navigator
      initialRouteName="Chat"
      lazy={true}
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
          tabBarLabel: 'Chat',
          tabBarIcon: () => (
            <View
              style={[
                styleApp.center2,
                {
                  position: 'absolute',
                  zIndex: -1,
                  backgroundColor: 'red',
                  height: '100%',
                },
              ]}>
              <AllIcon
                name="check"
                color={colors.primary}
                size={20}
                type={'font'}
              />
            </View>
          ),
        }}
        name="Chat">
        {() => (
          <ListMessages
            user={user}
            session={session}
            objectID={objectID}
            initialMessage={initialMessage ? initialMessage : ''}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        options={{
          tabBarLabel: 'Videos',
        }}
        name="Videos">
        {() => ListContents({session})}
      </Tab.Screen>

      {/* <Tab.Screen options={{tabBarLabel: 'Players'}} name="Players">
        {() => ListPlayers({session, messages})}
      </Tab.Screen> */}
    </Tab.Navigator>
  );
};

export default MyTabs;
