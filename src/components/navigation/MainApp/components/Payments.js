import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Payments from '../../../app/elementsUser/elementsPayment/Payments';
import NewCard from '../../../app/elementsUser/elementsPayment/NewCard';
import NewMethod from '../../../app/elementsUser/elementsPayment/NewMethod';
import NewBankAccount from '../../../app/elementsUser/elementsPayment/NewBankAccount';
import CreateConnectAccount from '../../../app/elementsUser/elementsPayment/CreateConnectAccount';
import DetailCard from '../../../app/elementsUser/elementsPayment/DetailCard';
import Scan from '../../../app/elementsUser/elementsPayment/Scan';
import ApplePay from '../../../app/elementsUser/elementsPayment/ApplePay';

const Stack = createStackNavigator();
const OnBoarding = () => {
  return (
    <Stack.Navigator initialRouteName="Payments" headerMode="none">
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="NewCard" component={NewCard} />
      <Stack.Screen name="NewMethod" component={NewMethod} />
      <Stack.Screen name="NewBankAccount" component={NewBankAccount} />
      <Stack.Screen
        name="CreateConnectAccount"
        component={CreateConnectAccount}
      />
      <Stack.Screen name="DetailCard" component={DetailCard} />
      <Stack.Screen name="Scan" component={Scan} />
      <Stack.Screen name="ApplePay" component={ApplePay} />
    </Stack.Navigator>
  );
};

export default OnBoarding;
