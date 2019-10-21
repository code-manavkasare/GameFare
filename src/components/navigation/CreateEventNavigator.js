import React from 'react'
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import {Button} from 'react-native'
import Page1 from '../app/elementsEventCreate/Page1'


const AppNavigator = createStackNavigator(
    {
        page1: {
            screen:Page1,
            headerBackTitleVisible:true,
            navigationOptions: ({ navigation }) => ({
                title: 'Home',
                headerTitleStyle:{fontFamily:'OpenSans-SemiBold'},
                headerLeft: () => (
                    <Button
                      onPress={() => navigation.navigate('Home')}
                      title="Info"
                      color="blue"
                    />
                ),
            }),
        },
        // page2: {
        //     screen:ProfilePage,
        // },
        // page2: {
        //     screen:EventPage,
        // },
    },
    {
        initialRouteName:'page1',
        headerMode: 'none',
        mode: 'card',
        cardOverlayEnabled:true
    }
  );

  
  export default createAppContainer(AppNavigator);