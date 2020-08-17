import StatusBar from '@react-native-community/status-bar';

export default function initialPage(props) {
    StatusBar.setBarStyle('dark-content', true);
    StatusBar.setHidden(false, true);
    props.navigation.navigate('TabsApp');
    return null;
}