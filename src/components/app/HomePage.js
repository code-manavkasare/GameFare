import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from 'react-native';

import firebase from 'react-native-firebase'
import HeaderHome from './elementsHome/HeaderHome'
import FooterHome from './elementsHome/FooterHome'
import ListEvents from './elementsHome/ListEvent'
import styleApp from '../style/style'
import colors from '../style/colors'
import ButtonRound from '../layout/buttons/ButtonRound'
const { height, width } = Dimensions.get('screen')
import StatusBar from '@react-native-community/status-bar';

export default class HomeScreen extends React.Component {
    async componentDidMount() {
        console.log('lalalala')
        
        firebase.messaging().subscribeToTopic('allUsers');
    }
    navigate(val,data) {
        //statusBar.setBarStyle('dark-content',true)
        this.props.navigation.navigate(val,data)
    }
  render() {
    return (
      <View style={{ height:height}}>
        <HeaderHome navigate={this.navigate.bind(this)}/>

        <ListEvents navigate={this.navigate.bind(this)}/>

        <FooterHome navigate={(val) => this.props.navigation.navigate(val)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    button:{
        height:40,width:120,
        backgroundColor:'blue',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
