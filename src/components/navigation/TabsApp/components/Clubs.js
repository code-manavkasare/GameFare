import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ClubsPage from '../../../app/clubsPage';

const Stack = createStackNavigator();
const Clubs = () => {
  return (
    <Stack.Navigator initialRouteName="ClubsPage" headerMode="none">
      <Stack.Screen name="ClubsPage" component={ClubsPage} />
    </Stack.Navigator>
  );
};

export default Clubs;
