import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import PickMembers from '../../../app/elementsCreateChallenge/PickMembers';
import PickInfos from '../../../app/elementsCreateChallenge/PickInfos';
import PickTeams from '../../../app/elementsCreateChallenge/PickTeams';
import PickAddress from '../../../app/elementsCreateChallenge/PickAddress';
import SummaryChallenge from '../../../app/elementsCreateChallenge/SummaryChallenge';

const Stack = createStackNavigator();
const CreateChallenge = () => {
  return (
    <Stack.Navigator initialRouteName="PickTeams" headerMode="none">
      <Stack.Screen name="PickTeams" component={PickTeams} />
      <Stack.Screen name="PickMembers" component={PickMembers} />
      <Stack.Screen name="PickInfos" component={PickInfos} />
      <Stack.Screen name="PickAddress" component={PickAddress} />
      <Stack.Screen name="SummaryChallenge" component={SummaryChallenge} />
    </Stack.Navigator>
  );
};

export default CreateChallenge;
