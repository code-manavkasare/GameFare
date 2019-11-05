import React, {Component} from 'react';
import { 
    Image,
    Text,
} from 'react-native';


import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import colors from '../style/colors'
import styles from '../style/style'
import AllIcons from '../layout/icons/AllIcons'

import HomePage from '../app/HomePage'
import ProfilePage from '../app/ProfilePage'
import Wallet from '../app/elementsUser/elementsProfile/Wallet'
import Settings from '../app/elementsUser/elementsProfile/Settings'
import EventPage from '../app/EventPage'
import Checkout from '../app/elementsJoining/Checkout'
import Coach from '../app/elementsJoining/Coach'

import Phone from '../login/Phone'
import Verify from '../login/Verify'
import Complete from '../login/Complete'
import ListCountry from '../login/elementsFlags/ListCountry'

import CreateEvent0 from '../app/elementsEventCreate/Page0'
import CreateEvent1 from '../app/elementsEventCreate/Page1'
import CreateEvent2 from '../app/elementsEventCreate/Page2'
import CreateEvent3 from '../app/elementsEventCreate/Page3'
import Contacts from '../app/elementsEventCreate/elementsContacts/Contacts'
import NewContact from '../app/elementsEventCreate/elementsContacts/NewContact'

import LocationSelector from '../app/elementsEventCreate/LocationSelector'
import DateSelector from '../app/elementsEventCreate/DateSelector'

import ListEvents from '../app/elementsUser/events/ListEvents'

import Payments from '../app/elementsUser/elementsPayment/Payments'
import NewCard from '../app/elementsUser/elementsPayment/NewCard'
import NewMethod from '../app/elementsUser/elementsPayment/NewMethod'
import DetailCard from '../app/elementsUser/elementsPayment/DetailCard'
import Scan from '../app/elementsUser/elementsPayment/Scan'
import ApplePay from '../app/elementsUser/elementsPayment/ApplePay'

import Alert from '../layout/alerts/Alert'


const CreateEventNavigator = createStackNavigator(
    {
        CreateEvent0:CreateEvent0,
        CreateEvent1:CreateEvent1,
        CreateEvent2:CreateEvent2,
        CreateEvent3:CreateEvent3,
    },
    {
        initialRouteName:'CreateEvent0',
       //  headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);

const ContactNavigator = createStackNavigator(
    {
        Contacts:Contacts,
        NewContact:NewContact
    },
    {
        initialRouteName:'Contacts',
       //  headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);


const JoinNavigator = createStackNavigator(
    {
        Event: EventPage,
        Checkout:Checkout,
        Coach:Coach,
    },
    {
        initialRouteName:'Event',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);

const HomePageNavigator = createStackNavigator(
    {
        Home:HomePage,
    },
    {
        initialRouteName:'Home',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);

const ListEventPageNavigator = createStackNavigator(
    {
        ListEvents:ListEvents,
    },
    {
        initialRouteName:'ListEvents',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);

const EventsNavigator = createStackNavigator(
    {
        ListEvents: ListEventPageNavigator,
    },
    {
        initialRouteName:'ListEvents',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);



const ProfileNavigator = createStackNavigator(
    {
        Profile: ProfilePage,
        Wallet:Wallet,
        Settings:Settings
    },
    {
        initialRouteName:'Profile',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);

const LoginNavigator = createStackNavigator(
    {
        Phone:Phone,
        Verify:Verify,
        Complete:Complete
    },
    {
        initialRouteName:'Phone',
        // headerMode: 'none',
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
        DetailCard:DetailCard,
        Scan:Scan
    },
    {
        initialRouteName:'Payments',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
);

const FlagsNavigator = createStackNavigator(
    {
        ListCountry:ListCountry
    },
    {
        initialRouteName:'ListCountry',
        // headerMode: 'none',
        mode: 'modal',
        cardOverlayEnabled:true
    }
);

const MainApp = createBottomTabNavigator(
    {
        Home: HomePageNavigator,
        ListEvents:EventsNavigator,
        Profile: ProfileNavigator,
    },
    {
      defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon:({ focused, tintColor }) => { 
            const { routeName } = navigation.state
            if (routeName == 'Home') return <AllIcons name='search' type='mat' color={focused?colors.primary:colors.title} size={20} />
            if (routeName == 'ListEvents') return <AllIcons name='calendar' type='font' color={focused?colors.primary:colors.title} size={14} />
            if (routeName == 'Profile') return <AllIcons name='user-circle' type='font' color={focused?colors.primary:colors.title} size={17} />
        },
        tabBarLabel:({ focused, tintColor }) => { 
            const { routeName } = navigation.state
            if (routeName == 'Home') return <Text style={focused?styles.footerText:styles.footerTextOff}>Home</Text>
            if (routeName == 'ListEvents') return <Text style={focused?styles.footerText:styles.footerTextOff}>Events</Text>
            if (routeName == 'Profile') return <Text style={focused?styles.footerText:styles.footerTextOff}>Profile</Text>
        }
      }),
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      },
    },
    {
        initialRouteName:'Home',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
  );

  const MainStack = createStackNavigator(
    {
        MainApp:MainApp,
        Event:JoinNavigator,
        CreateEvent1:CreateEventNavigator
    },
    {
        initialRouteName:'MainApp',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
)

const LocationNavigator = createStackNavigator(
    {
        Location: LocationSelector,
    },
    {
        initialRouteName:'Location',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);
const DateNavigator = createStackNavigator(
    {
        Date: DateSelector,
    },
    {
        initialRouteName:'Date',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);



  const RootStack = createStackNavigator(
    {
        MainApp:MainStack,
        SignIn:LoginNavigator,
        ListCountry:FlagsNavigator,
        Alert:{screen:Alert,gesturesEnabled:false},
        Payments:PaymentsNavigator,
        Date:DateNavigator,
        Location:LocationNavigator,
        ContactNavigator:ContactNavigator
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
