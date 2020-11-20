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
import NotificationPage from '../app/elementsUser/elementsProfile/NotificationPage';
import SelectVideosFromLibrary from '../app/videoLibraryPage/index';
import Alert from '../layout/alerts/Alert';
import {DepthModal} from './transitions/DepthModal';
import sizes from '../style/sizes';
const Stack = createStackNavigator();
function InitialStack() {
  const AlertSpec = DepthModal({heightScale: 0});
  const CallTabSpec = DepthModal({top: sizes.marginTopApp + 25});
  const NotificationPageSpec = DepthModal({top: sizes.marginTopApp + 25});
  const SignInSpec = DepthModal({top: sizes.marginTopApp + 25});
  return (
    <Stack.Navigator
      initialRouteName="MainApp"
      headerMode="none"
      mode={'modal'}>
      <Stack.Screen
        name="MainApp"
        component={MainApp}
        options={{cardStyle: {backgroundColor: 'black'}}}
      />

      <Stack.Screen name="SignIn" component={SignIn} options={AlertSpec} />
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
        name="UploadQueueList"
        component={QueueList}
        options={{...AlertSpec}}
      />

      <Stack.Screen
        name="ModalCallTab"
        component={CallTabPage}
        options={{...CallTabSpec}}
      />

      <Stack.Screen
        name="UserDirectory"
        component={UserDirectoryPage}
        options={{...CallTabSpec}}
      />

      <Stack.Screen
        name="Coaches"
        component={Coaches}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Alert"
        component={Alert}
        options={{
          ...AlertSpec,
        }}
      />

      <Stack.Screen
        name="SelectVideosFromLibrary"
        component={SelectVideosFromLibrary}
        options={{...CallTabSpec}}
      />

      <Stack.Screen
        name="NotificationPage"
        component={NotificationPage}
        options={NotificationPageSpec}
      />
    </Stack.Navigator>
  );
}

export default InitialStack;
