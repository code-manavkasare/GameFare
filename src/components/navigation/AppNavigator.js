import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import HomePage from '../app/HomePage'
import ProfilePage from '../app/ProfilePage'
import EventPage from '../app/EventPage'
import CreateEvent from '../app/CreateEvent'

import CreateEvent1 from '../app/elementsEventCreate/Page1'
import CreateEvent2 from '../app/elementsEventCreate/Page2'

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
  
  export default createAppContainer(AppNavigator);
