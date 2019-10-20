import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import HomeScreen from '../app/HomePage'
import LoadingScreen from '../app/LoadingScreen'

const AppNavigator = createStackNavigator(
    {
        Home: {
            screen:HomeScreen,
            headerBackTitleVisible:true,
            navigationOptions: ({ navigation }) => ({
                title: 'Home',
                // headerBackTitle: null,
            }),
        },
        Loading:LoadingScreen,
    },
    {
        initialRouteName:'Home',
        // headerMode: 'none',
        mode: 'card',
    }
  );
  
  export default createAppContainer(AppNavigator);