import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Contacts from '../../../app/elementsEventCreate/elementsContacts/Contacts';
import NewContact from '../../../app/elementsEventCreate/elementsContacts/NewContact';

const Stack = createStackNavigator();
const ContactsNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Contacts" headerMode="none">
      <Stack.Screen name="Contacts" component={Contacts} />
      <Stack.Screen name="NewContact" component={NewContact} />
    </Stack.Navigator>
  );
};

export default ContactsNavigation;
