import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';


import VideoLibraryPage from '../../../app/videoLibraryPage';
import ExpandedSnippetsView from '../../../app/videoLibraryPage/components/expandedSnippetsView';

const Stack = createStackNavigator();
const VideoLibrary = () => {
  return (
    <Stack.Navigator initialRouteName="VideoLibraryPage" headerMode="none">
      <Stack.Screen name="VideoLibraryPage" component={VideoLibraryPage} />
      <Stack.Screen name="ExpandedSnippetsView" component={ExpandedSnippetsView} />
    </Stack.Navigator>
  );
};

export default VideoLibrary;
