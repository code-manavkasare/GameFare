import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import HomePage from '../app/HomePage'
import ProfilePage from '../app/ProfilePage'
import EventPage from '../app/EventPage'
import CreateEvent from '../app/CreateEvent'

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
        Profile: {
            screen:ProfilePage,
        },
        Event: {
            screen:EventPage,
        },
        CreateEvent:CreateEvent,
    },
    {
        initialRouteName:'Home',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
  );
  
  export default createAppContainer(AppNavigator);