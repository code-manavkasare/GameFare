import React, {Component} from 'react';
import { 
    Image,
    Text,
    View,
    TouchableOpacity
} from 'react-native';


import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import colors from '../style/colors'
import styles from '../style/style'
import AllIcons from '../layout/icons/AllIcons'
import Button from '../layout/Views/Button'

import HomePage from '../app/HomePage'
import ProfilePage from '../app/ProfilePage'
import Wallet from '../app/elementsUser/elementsProfile/Wallet'
import Settings from '../app/elementsUser/elementsProfile/Settings'
import EventPage from '../app/EventPage'
import GroupPage from '../app/GroupPage'
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

import CreateGroup0 from '../app/elementsGroupCreate/Page0'
import CreateGroup1 from '../app/elementsGroupCreate/Page1'

import LocationSelector from '../app/elementsEventCreate/LocationSelector'
import DateSelector from '../app/elementsEventCreate/DateSelector'

import ListEvents from '../app/elementsUser/events/ListEvents'
import ListGroups from '../app/elementsUser/groups/ListGroups'

import Payments from '../app/elementsUser/elementsPayment/Payments'
import NewCard from '../app/elementsUser/elementsPayment/NewCard'
import NewMethod from '../app/elementsUser/elementsPayment/NewMethod'
import DetailCard from '../app/elementsUser/elementsPayment/DetailCard'
import Scan from '../app/elementsUser/elementsPayment/Scan'
import ApplePay from '../app/elementsUser/elementsPayment/ApplePay'

import Alert from '../layout/alerts/Alert'
import AlertAddress from '../layout/alerts/AlertAddress'
import AlertCall from '../layout/alerts/AlertCall'

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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
    }
);

const CreateGroupNavigator = createStackNavigator(
    {
        CreateGroup0:CreateGroup0,
        CreateGroup1:CreateGroup1,
    },
    {
        initialRouteName:'CreateGroup0',
       //  headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
    }
);

const JoinGroupNavigator = createStackNavigator(
    {
        Group: GroupPage,
    },
    {
        initialRouteName:'Group',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
    }
);

const ListGroupPageNavigator = createStackNavigator(
    {
        ListGroups:ListGroups,
    },
    {
        initialRouteName:'ListGroups',
        // headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:false
    }
);

const GroupsNavigator = createStackNavigator(
    {
        ListGroups: ListGroupPageNavigator,
    },
    {
        initialRouteName:'ListGroups',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
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
        cardOverlayEnabled:false,
        cardShadowEnabled:false
    }
);

const MainApp = createBottomTabNavigator(
    {
        Home: {
            screen:HomePageNavigator,
            tabBarIcon: ({ tintColor, focused }) => (
                <View style={{height:'100%',width:'100%',backgroundColor:'red'}}>
                    <Image source={focused? star_check : star} style={styles.icon} />
                    <Text style={[styles.name, {color: tintColor}]}>Kampanjer</Text>
                </View>
            )
        },
        ListGroups:GroupsNavigator,
        ListEvents:EventsNavigator,
        Profile: ProfileNavigator,
    },
    {
      defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon:({ focused, tintColor }) => { 
            const { routeName } = navigation.state
            if (routeName == 'Home') {
                if (focused) {
                    return <Image source={require('../../img/footer/findOn.png')} style={styles.iconFooter} />
                }
                return <Image source={require('../../img/footer/findOff.png')} style={styles.iconFooter} />
            }
            if (routeName == 'ListGroups') {
                if (focused) {
                    return <Image source={require('../../img/footer/inviteOn.png')} style={styles.iconFooter} />
                }
                return <Image source={require('../../img/footer/inviteOff.png')} style={styles.iconFooter} />
            }
            if (routeName == 'ListEvents') {
                if (focused) {
                    return <Image source={require('../../img/footer/apptOn.png')} style={styles.iconFooter} />
                }
                return <Image source={require('../../img/footer/apptOff.png')} style={styles.iconFooter} />
            }
            if (routeName == 'Profile') {
                if (focused) {
                    return <Image source={require('../../img/footer/profileOn.png')} style={styles.iconFooter} />
                }
                return <Image source={require('../../img/footer/profileOff.png')} style={styles.iconFooter} />
            }
        },
        tabBarLabel:({ focused, tintColor }) => { 
            const { routeName } = navigation.state
            if (routeName == 'Home') return <Text style={focused?styles.footerText:styles.footerTextOff}>Home</Text>
            if (routeName == 'ListGroups') return <Text style={focused?styles.footerText:styles.footerTextOff}>Groups</Text>
            if (routeName == 'ListEvents') return <Text style={focused?styles.footerText:styles.footerTextOff}>Events</Text>
            if (routeName == 'Profile') return <Text style={focused?styles.footerText:styles.footerTextOff}>Profile</Text>
        }
      }),
      tabBarOptions: {
        //activeTintColor: 'tomato',
        //inactiveTintColor: 'gray',
        showLabel:true,
        style: {
            backgroundColor: 'white',
        },
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
        Group:JoinGroupNavigator,
        CreateEvent1:CreateEventNavigator,
        CreateGroup1:CreateGroupNavigator,
    },
    {
        initialRouteName:'MainApp',
        headerMode: 'none',
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
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:false
    }
);



  const RootStack = createStackNavigator(
    {
        MainApp:MainStack,
        SignIn:LoginNavigator,
        ListCountry:FlagsNavigator,
        Alert:{screen:Alert,gesturesEnabled:false},
        AlertAddress:{screen:AlertAddress,gesturesEnabled:false},
        AlertCall:AlertCall,
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
        cardOverlayEnabled:false
    }
)

  
  export default createAppContainer(RootStack);
