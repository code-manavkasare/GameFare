import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';


import VideoLibraryPage from '../../../app/videoLibraryPage';

const Stack = createStackNavigator();
const VideoLibrary = () => {
  return (
    <Stack.Navigator initialRouteName="VideoLibraryPage" headerMode="none">
      <Stack.Screen name="VideoLibraryPage" component={VideoLibraryPage} />
    </Stack.Navigator>
  );
};

export default VideoLibrary;
