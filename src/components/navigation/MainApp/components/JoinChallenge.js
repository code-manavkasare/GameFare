import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ChallengePage from '../../../app/challengePage/index';
import PickMembers from '../../../app/elementsCreateChallenge/PickMembers';
import PickTeams from '../../../app/elementsCreateChallenge/PickTeams';
import SummaryChallenge from '../../../app/elementsCreateChallenge/SummaryChallenge';
import JoinAsContact from '../../../app/elementsCreateChallenge/JoinAsContact';
import PublishResult from '../../../app/elementsCreateChallenge/PublishResult';

const Stack = createStackNavigator();
const JoinChallenge = () => {
  return (
    <Stack.Navigator initialRouteName="Challenge" headerMode="none">
      <Stack.Screen name="Challenge" component={ChallengePage} />
      <Stack.Screen name="PickTeams" component={PickTeams} />
      <Stack.Screen name="PickMembers" component={PickMembers} />
      <Stack.Screen name="PublishResult" component={PublishResult} />
      <Stack.Screen name="JoinAsContact" component={JoinAsContact} />
      <Stack.Screen name="SummaryChallenge" component={SummaryChallenge} />
    </Stack.Navigator>
  );
};

export default JoinChallenge;
