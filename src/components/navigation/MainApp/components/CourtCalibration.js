import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import CameraAngle from '../../../app/coachFlow/CourtCalibration/index';
import CourtPositioning from '../../../app/coachFlow/CourtCalibration/components/CourtPositioning';

const Stack = createStackNavigator();
const Alerts = () => {
  return (
    <Stack.Navigator initialRouteName="CameraAngle" headerMode="none">
      <Stack.Screen name="CameraAngle" component={CameraAngle} />
      <Stack.Screen name="CourtPositioning" component={CourtPositioning} />
    </Stack.Navigator>
  );
};

export default Alerts;
