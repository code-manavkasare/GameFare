import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import MainApp from './MainApp/index';
import SignIn from './SignIn/index';
import ListCountry from '../login/elementsFlags/ListCountry';
import Payments from './MainApp/components/Payments';
import NewConversation from '../app/elementsMessage/NewConversation';
import Coaches from './MainApp/components/Coaches';
import CallTabPage from '../app/callTab';
import QueueList from '../app/elementsUpload/QueueList';
import UserDirectoryPage from '../app/userDirectory';
import Alert from '../layout/alerts/Alert';
import {DepthModal} from './transitions/DepthModal';
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

      {/* <Stack.Screen name="ProfilePage" component={ProfilePage} /> */}
      <Stack.Screen
        name="UploadQueueList"
        component={QueueList}
        options={{...DepthModal}}
      />

      <Stack.Screen name="ModalCallTab" component={CallTabPage} />

      <Stack.Screen name="UserDirectory" component={UserDirectoryPage} />

      <Stack.Screen
        name="Coaches"
        component={Coaches}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="RootAlert"
        component={Alert}
        options={{
          cardStyle: {backgroundColor: 'transparent'},
          gestureEnabled: false,
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default InitialStack;
