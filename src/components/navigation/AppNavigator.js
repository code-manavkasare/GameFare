import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import HomePage from '../app/HomePage'
import ProfilePage from '../app/ProfilePage'
import EventPage from '../app/EventPage'

import Phone from '../login/Phone'
import Verify from '../login/Verify'
import ListCountry from '../login/elementsFlags/ListCountry'

import CreateEvent1 from '../app/elementsEventCreate/Page1'
import CreateEvent2 from '../app/elementsEventCreate/Page2'

import Alert from '../layout/alerts/Alert'


const AppNavigator = createStackNavigator(
    {
        Home: {
            screen:HomePage,
            headerBackTitleVisible:true,
            navigationOptions: ({ navigation }) => ({
                title: 'Home',
                // headerBackTitle: null,
            }),
        },
        Profile: ProfilePage,
        Event: EventPage,
        CreateEvent1:CreateEvent1,
        CreateEvent2:CreateEvent2,
    },
    {
        initialRouteName:'Home',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
);

const LoginNavigator = createStackNavigator(
    {
        Phone:Phone,
        Verify:{
            screen:Verify,
            navigationOptions: ({ navigation }) => ({
                title: 'Home',
                gesturesEnabled: true,
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

const RootStack = createStackNavigator(
    {
        MainApp:AppNavigator,
        SignIn:LoginNavigator,
        ListCountry:ListCountry,
        Alert:{
            screen:Alert,
            navigationOptions: {
                style: { backgroundColor: 'red' }, //Does not work, red is just to ilustrate, should be transparent,
                cardStyle: { //Does not work,
                    backgroundColor: 'transparent',
                },
                bodyStyle: { //Does not work,
                    backgroundColor: 'blue',
                },
            }
        }
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
