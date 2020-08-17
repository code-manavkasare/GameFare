import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import MainApp from './MainApp/index';
import SignIn from './SignIn/index';
import ListCountry from '../login/elementsFlags/ListCountry';
import Payments from './MainApp/components/Payments';

import NewConversation from '../app/elementsMessage/NewConversation';
import PickMembersPage from '../app/pickMembers';

import Coaches from './MainApp/components/Coaches';

import VideoPlayerPage from '../app/videoPlayerPage/index';
import Session from './TabsApp/components/Session';

import Alert from '../layout/alerts/Alert';

import ShareVideo from '../app/shareVideo';

const Stack = createStackNavigator();
function InitialStack() {
  return (
    <Stack.Navigator
      initialRouteName="MainApp"
      headerMode="none"
      mode={'modal'}>
      <Stack.Screen name="MainApp" component={MainApp} />
      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="ListCountry"
        component={ListCountry}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Payments"
        component={Payments}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="NewConversation"
        component={NewConversation}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Alert"
        component={Alert}
        options={{
          cardStyle: {backgroundColor: 'transparent'},
          gestureEnabled: false,
        }}
      />

      {/* <Stack.Screen name="ProfilePage" component={ProfilePage} /> */}

      <Stack.Screen
        name="PickMembers"
        component={PickMembersPage}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Coaches"
        component={Coaches}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="ShareVideo"
        component={ShareVideo}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default InitialStack;
