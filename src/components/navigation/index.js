import React from 'react';
import {StatusBar} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import MainApp from './MainApp/index';
import SignIn from './SignIn/index';
import ListCountry from '../login/elementsFlags/ListCountry';
import NewConversation from '../app/elementsMessage/NewConversation';
import VideoPlayerPage from '../app/videoPlayerPage/index';
import CallTabPage from '../app/callTab';
import QueueList from '../app/elementsUpload/QueueList';
import SearchPage from '../app/searchPage';
import NotificationPage from '../app/elementsUser/elementsProfile/NotificationPage';
import SelectVideosFromLibrary from '../app/videoLibraryPage/index';
import Alert from '../layout/alerts/Alert';
import {SheetModal} from './transitions/SheetModal';
import {marginTopApp, width} from '../style/sizes';
import Conversation from '../app/elementsMessage/Conversation';
import SessionSettings from '../app/TeamPage/components/SessionSettings';

import Payments from './MainApp/components/Payments';
import ProfilePage from '../app/elementsUser/elementsProfile/ProfilePage';
import InteractiveView from '../utility/initialInteractions/InteractiveView';

const Stack = createStackNavigator();
function InitialStack() {
  const AlertSpec = SheetModal({heightScale: 0});
  const FullScreenModalSpec = SheetModal({
    heightScale: 0,
    gestureHeight: 1 / 6,
    statusBar: 'dark-content',
  });
  const VideoPlayerSpec = SheetModal({
    heightScale: 0,
    gestureHeight: 1 / 6,
    statusBar: 'light-content',
  });
  const SheetModalSpec = SheetModal({
    top: marginTopApp + 25,
    gestureHeight: 1 / 3,
  });
  const NotificationPageSpec = SheetModal({
    top: marginTopApp + 25,
    gestureHeight: 1 / 3,
  });
  return (
    <Stack.Navigator
      initialRouteName="MainApp"
      screenOptions={{
        gestureResponseDistance: {
          horizontal: width,
        },
        header: () => <StatusBar barStyle={'dark-content'} />,
      }}>
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
        name="VideoPlayerPage"
        component={VideoPlayerPage}
        options={VideoPlayerSpec}
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
        options={AlertSpec}
      />

      <Stack.Screen
        name="ModalCallTab"
        component={CallTabPage}
        options={SheetModalSpec}
      />

      <Stack.Screen
        name="SearchPage"
        component={SearchPage}
        options={SheetModalSpec}
      />

      <Stack.Screen name="Alert" component={Alert} options={AlertSpec} />

      <Stack.Screen
        name="SelectVideosFromLibrary"
        component={SelectVideosFromLibrary}
        options={SheetModalSpec}
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

      <Stack.Screen
        name="Payments"
        component={Payments}
        options={FullScreenModalSpec}
      />

      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={FullScreenModalSpec}
      />

      <Stack.Screen
        name="InteractiveView"
        component={InteractiveView}
        options={{
          animationEnabled: false,
          gestureEnabled: false,
          cardStyle: {backgroundColor: 'transparent'},
        }}
      />

      <Stack.Screen name="Conversation" component={Conversation} />
      <Stack.Screen name="SessionSettings" component={SessionSettings} />
    </Stack.Navigator>
  );
}

export default InitialStack;
