import React, {Component} from 'react';
import { 
    Image,
    Text,
    View,
    TouchableOpacity,
    Dimensions
} from 'react-native';
const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";


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
import AddGroups from '../app/elementsEventCreate/elementsAddGroups/AddGroups'
import Contacts from '../app/elementsEventCreate/elementsContacts/Contacts'
import NewContact from '../app/elementsEventCreate/elementsContacts/NewContact'

import CreateGroup0 from '../app/elementsGroupCreate/Page0'
import CreateGroup1 from '../app/elementsGroupCreate/Page1'

import LocationSelector from '../app/elementsEventCreate/LocationSelector'
import DateSelector from '../app/elementsEventCreate/DateSelector'


import ListGroups from '../app/elementsGroupTab/GroupList'

import Payments from '../app/elementsUser/elementsPayment/Payments'
import NewCard from '../app/elementsUser/elementsPayment/NewCard'
import NewMethod from '../app/elementsUser/elementsPayment/NewMethod'
import DetailCard from '../app/elementsUser/elementsPayment/DetailCard'
import Scan from '../app/elementsUser/elementsPayment/Scan'
import ApplePay from '../app/elementsUser/elementsPayment/ApplePay'

import Alert from '../layout/alerts/Alert'
import AlertAddress from '../layout/alerts/AlertAddress'
import AlertCall from '../layout/alerts/AlertCall'

import InitialPage from '../app/elementsOnBoard/InitialPage'
import SportSelect from '../app/elementsOnBoard/SportSelect'
import LocationSelect from '../app/elementsOnBoard/LocationSelect'


import MessageList from '../app/elementsMessage/MessageList'

const CreateEventNavigator = createStackNavigator(
    {
        CreateEvent0:CreateEvent0,
        CreateEvent1:CreateEvent1,
        CreateEvent2:CreateEvent2,
        CreateEvent3:CreateEvent3,
        AddGroups:AddGroups,
    },
    {
        initialRouteName:'CreateEvent0',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:true
    }
);

const CreateGroupNavigator = createStackNavigator(
    {
        CreateGroup0:CreateGroup0,
        CreateGroup1:CreateGroup1,
    },
    {
        initialRouteName:'CreateGroup0',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:true
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
        Checkout:Checkout,
        Event:EventPage,
        Coach:Coach,
    },
    {
        initialRouteName:'Event',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:true
    }
);

const JoinGroupNavigator = createStackNavigator(
    {
        Group: GroupPage,
    },
    {
        initialRouteName:'Group',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:true
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
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:true
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
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:true
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

const MainApp = createBottomTabNavigator(
    {   
        Home:HomePage,
        ListGroups:ListGroups,
        MessageList:MessageList,
        Profile: ProfileNavigator,
        
    },
    /*
    <Button   view={() => {
          return <Row >
            <Col size={10} style={[styleApp.center]}>
              <AllIcons name={routeName == 'Home'?
                'calendar'
                :
                routeName == 'ListGroups'?
                'tennis'
                :routeName == 'Profile'?
                'profileFooter'
                :null
                } size={18} color={tintColor} style={styles.iconFooter} type='moon'/>
                <Text style={[styles.footerText,{color:tintColor,marginTop:10}]}>
                {routeName == 'Home'?
                'EVENTS'
                :
                routeName == 'ListGroups'?
                'GROUPS'
                :routeName == 'Profile'?
                'PROFILE'
                :null
                }
                </Text>
            </Col>
          </Row>
        }}
        click={() => navigation.navigate(routeName)}
        color={'white'}
        style={[styles.center,{borderTopWidth:1.5,marginTop:5,borderColor:tintColor,paddingTop:6,backgroundColor:'white',width:'100%',height:'120%'}]}
        onPressColor={colors.off}
        />
    
    */
    {
      defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon:({ focused, tintColor }) => { 
            const { routeName } = navigation.state
            var borderOff = 'white'
            return <Button   view={() => {
                return <Row style={{height:45}}>
                  <Col size={10} style={[styles.center]}>
                    <AllIcons name={routeName == 'Home'?
                      'calendar2'
                      :routeName == 'ListGroups'?
                      'suitecase'
                      :routeName == 'MessageList'?
                      'messageTab'
                      :routeName == 'Profile'?
                      'profileFooter'
                      :null
                      } size={16} color={tintColor} style={styles.iconFooter} type='moon'/>
                      <Text style={[styles.footerText,{color:tintColor,marginTop:6,marginBottom:5,fontSize:12.5}]}>
                      {routeName == 'Home'?
                      'Events'
                      :routeName == 'ListGroups'?
                      'Groups'
                      :routeName == 'MessageList'?
                      'Message'
                      :routeName == 'Profile'?
                      'Profile'
                      :null
                      }
                      </Text>
                  </Col>
                </Row>
              }}
              click={() => navigation.navigate(routeName)}
              color={'white'}
              style={[{borderTopWidth:1.5,marginTop:0,borderColor:focused?colors.primary:'white',paddingTop:15,backgroundColor:'white',width:'100%',height:'100%',borderRadius:0,paddingLeft:0,paddingRight:0}]}
              onPressColor={'white'}
              />
        },
        tabBarLabel:({ focused, tintColor }) => { 
            const { routeName } = navigation.state
            if (routeName == 'Home') return <Text style={[styles.input,{color:tintColor}]}>Events</Text>
            if (routeName == 'ListGroups') return <Text style={[styles.footerText,{color:tintColor}]}>GROUPS</Text>
            if (routeName == 'MessageList') return <Text style={[styles.footerText,{color:tintColor}]}>GROUPS</Text>
            if (routeName == 'Profile') return <Text style={[styles.footerText,{color:tintColor}]}>PROFILE</Text>
        },
      }),   
      tabBarOptions: {
        activeTintColor: colors.primary,
        inactiveTintColor: colors.title,
        showLabel:false,
        style: [styles.shade,{
            borderTopWidth:0.5,
            shadowOpacity:0.04,
            backgroundColor: colors.white,
            borderTopColor:colors.grey,
            height:46,

            paddingBottom:20,
        }],
      },
    },
    {
        initialRouteName:'Home',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
  );

  const InitialPageNavigator = createStackNavigator(
    {
        InitialPage:InitialPage,
        LocationSelect:{screen:LocationSelect,
            navigationOptions:{
                gesturesEnabled:true,
                cardShadowEnabled:true
            }
        },
        SportSelect:{screen:SportSelect,
            navigationOptions:{
                gesturesEnabled:false,
                cardShadowEnabled:false
            }
        },
        LocationOnBoard:{screen:LocationSelector,
            navigationOptions:{
                gesturesEnabled:true,
                cardShadowEnabled:true
            }
        },
    },
    {
        initialRouteName:'InitialPage',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:false,
        cardShadowEnabled:true
    }
);

  const MainStack = createStackNavigator(
    {
        InitialPage:InitialPageNavigator,
        TabsApp:{
            screen:MainApp,
            navigationOptions:{
                gesturesEnabled:false,
                cardShadowEnabled:false
            },
        },
        Event:JoinNavigator,
        Group:JoinGroupNavigator,
        CreateEvent1:CreateEventNavigator,
        CreateGroup1:CreateGroupNavigator,
    },
    {
        initialRouteName:'InitialPage',
        headerMode: 'none',
    }
)



  const RootStack = createStackNavigator(
    {
        
        MainStack:MainStack,
        SignIn:LoginNavigator,
        ListCountry:{
            screen:ListCountry,
            navigationOptions:{
                gesturesEnabled:false
            },
        },
        Alert:{screen:Alert,gesturesEnabled:false},
        AlertAddress:{screen:AlertAddress,gesturesEnabled:false},
        AlertCall:AlertCall,
        Payments:PaymentsNavigator,
        Date:DateSelector,
        Location:LocationSelector,
        ContactNavigator:ContactNavigator
    },
    {
        initialRouteName:'MainStack',
        headerMode: 'none',
        mode: 'modal',
        transparentCard: true,
        cardStyle: { opacity: 1,},
        cardOverlayEnabled:false,
        navigationOptions:{
            gesturesEnabled:false
        },
        
    }
)

  
  export default createAppContainer(RootStack);
