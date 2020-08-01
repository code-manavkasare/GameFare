import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import MainApp from './MainApp/index';
import SignIn from './SignIn/index';
import ListCountry from '../login/elementsFlags/ListCountry';
import Payments from './MainApp/components/Payments';

import LocationSelector from '../app/elementsEventCreate/LocationSelector';
import DateSelector from '../app/elementsEventCreate/DateSelector';

import Contacts from './MainApp/components/Contacts';
import NewConversation from '../app/elementsMessage/NewConversation';
import PickMembersPage from '../app/pickMembers';
import LocalVideoLibrary from '../app/videoLibraryPage/components/localVideoLibraryPage/index';

import Coaches from './MainApp/components/Coaches';

import CourtCalibration from './MainApp/components/CourtCalibration';

import Alert from '../layout/alerts/Alert';

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

      <Stack.Screen name="Location" component={LocationSelector} />
      <Stack.Screen name="Date" component={DateSelector} />

      <Stack.Screen name="Contacts" component={Contacts} />

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
        name="LocalVideoLibrary"
        component={LocalVideoLibrary}
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
        name="CourtCalibration"
        component={CourtCalibration}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default InitialStack;
