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
import Scan from '../app/elementsUser/elementsPayment/Scan'
import ApplePay from '../app/elementsUser/elementsPayment/ApplePay'

import Alert from '../layout/alerts/Alert'

const CreateEventNavigator = createStackNavigator(
    {
        CreateEvent1:CreateEvent1,
        CreateEvent2:CreateEvent2,
        CreateEvent3:CreateEvent3,
        CreateEvent4:CreateEvent4,
    },
    {
        initialRouteName:'CreateEvent1',
       //  headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);

const HomePagetNavigator = createStackNavigator(
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

const JoinNavigator = createStackNavigator(
    {
        Event: EventPage,
        Checkout:Checkout
    },
    {
        initialRouteName:'Event',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false
    }
);

const HomeNavigator = createStackNavigator(
    {
        Home: HomePagetNavigator,
        CreateEvent1:CreateEventNavigator,
        Event:JoinNavigator
        // CreateEvent1:CreateEvent1,
        // CreateEvent2:CreateEvent2,
        // CreateEvent3:CreateEvent3,
        // CreateEvent4:CreateEvent4,
        // Event: EventPage,
        // Checkout:Checkout
    },
    {
        initialRouteName:'Home',
        headerMode: 'none',
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
        CreateEvent1:CreateEventNavigator
        // CreateEvent1:CreateEvent1,
        // CreateEvent2:CreateEvent2,
        // CreateEvent3:CreateEvent3,
        // CreateEvent4:CreateEvent4,
        // Event: EventPage,
        // Checkout:Checkout
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
        mode: 'card',
        cardOverlayEnabled:true
    }
);

const DateNavigator = createStackNavigator(
    {
        Date:DateSelector,
        Location:LocationSelector
    },
    {
        initialRouteName:'Date',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
);

const LocationNavigator = createStackNavigator(
    {
        Location:LocationSelector
    },
    {
        initialRouteName:'Location',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
);



const MainApp = createBottomTabNavigator(
    {
        Home: HomeNavigator,
        ListEvents:EventsNavigator,
        Profile: ProfileNavigator,
    },
    {
      defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon:({ focused, tintColor }) => { 
            console.log('lalalalalallskdfjkdsfs')
            console.log(navigation)
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
        initialRouteName:'Location',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
  );

  const RootStack = createStackNavigator(
    {
        MainApp:MainApp,
        SignIn:LoginNavigator,
        ListCountry:FlagsNavigator,
        Alert:Alert,
        Location:LocationNavigator,
        Date:DateNavigator,
        Payments:PaymentsNavigator,
    },
    {
        initialRouteName:'MainApp',
        headerMode: 'none',
        mode: 'card',
        transparentCard: true,
        cardStyle: { opacity: 1,},
        cardOverlayEnabled:true
    }
)

  
  export default createAppContainer(RootStack);
