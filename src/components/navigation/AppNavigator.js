import React, {Component} from 'react';
import { 
    Image
} from 'react-native';


import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import colors from '../style/colors'

import HomePage from '../app/HomePage'
import ProfilePage from '../app/ProfilePage'
import EventPage from '../app/EventPage'
import Checkout from '../app/elementsJoining/Checkout'

import Phone from '../login/Phone'
import Verify from '../login/Verify'
import Complete from '../login/Complete'
import ListCountry from '../login/elementsFlags/ListCountry'

import CreateEvent1 from '../app/elementsEventCreate/Page1'
import CreateEvent2 from '../app/elementsEventCreate/Page2'
import CreateEvent3 from '../app/elementsEventCreate/Page3'
import CreateEvent4 from '../app/elementsEventCreate/Page4'

import LocationSelector from '../app/elementsEventCreate/LocationSelector'
import DateSelector from '../app/elementsEventCreate/DateSelector'

import ListEvents from '../app/elementsUser/events/ListEvents'

import Payments from '../app/elementsUser/elementsPayment/Payments'
import NewCard from '../app/elementsUser/elementsPayment/NewCard'
import NewMethod from '../app/elementsUser/elementsPayment/NewMethod'
import DetailCard from '../app/elementsUser/elementsPayment/DetailCard'
import ApplePay from '../app/elementsUser/elementsPayment/ApplePay'

import Alert from '../layout/alerts/Alert'



const AppNavigator = createStackNavigator(
    {
        Home: HomePage,
        Profile: ProfilePage,
        Event: EventPage,
        CreateEvent1:CreateEvent1,
        CreateEvent2:CreateEvent2,
        CreateEvent3:CreateEvent3,
        CreateEvent4:CreateEvent4,
        ListEvents:ListEvents,
        Checkout:Checkout
    },
    {
        initialRouteName:'Home',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);


const LoginNavigator = createStackNavigator(
    {
        Phone:Phone,
        Verify:{
            screen:Verify,
            navigationOptions: ({ navigation }) => ({
                gesturesEnabled: true,
            }),
        },
        Complete:{
            screen:Complete,
            navigationOptions: ({ navigation }) => ({
                gesturesEnabled: false,
            }),
        }
    },
    {
        initialRouteName:'Phone',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
);

const PaymentsNavigator = createStackNavigator(
    {
        Payments:Payments,
        NewCard:NewCard,
        ApplePay:ApplePay,
        NewMethod:NewMethod,
        DetailCard:DetailCard
    },
    {
        initialRouteName:'Payments',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
);

const RootStack = createStackNavigator(
    {
        MainApp:AppNavigator,
        SignIn:LoginNavigator,
        ListCountry:ListCountry,
        Alert:Alert,
        Location:LocationSelector,
        Date:DateSelector,
        Payments:PaymentsNavigator
    },
    {
        initialRouteName:'MainApp',
        headerMode: 'none',
        mode: 'modal',
        transparentCard: true,
        cardStyle: { opacity: 1,},
        cardOverlayEnabled:true
    }
)


  
  export default createAppContainer(RootStack);
