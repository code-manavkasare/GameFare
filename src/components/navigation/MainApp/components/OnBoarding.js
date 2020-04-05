import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import InitialPage from '../../../app/elementsOnBoard/InitialPage';
import SportSelect from '../../../app/elementsOnBoard/SportSelect';
import LocationSelect from '../../../app/elementsOnBoard/LocationSelect';

const Stack = createStackNavigator();
const OnBoarding = () => {
  return (
    <Stack.Navigator initialRouteName="InitialPage" headerMode="none">
      <Stack.Screen name="InitialPage" component={InitialPage} />
      <Stack.Screen name="SportSelect" component={SportSelect} />
      <Stack.Screen name="LocationSelect" component={LocationSelect} />
    </Stack.Navigator>
  );
};

export default OnBoarding;
