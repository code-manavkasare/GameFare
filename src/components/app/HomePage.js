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
import ListEvents from './elementsHome/ListEvent'
const { height, width } = Dimensions.get('screen')

export default class HomeScreen extends React.Component {
    async componentDidMount() {
        console.log('lalalala')
        var variables = await firebase.database().ref('variables').once('value')
        console.log(variables)
        variables = variables.val()
        console.log('bimbim')
        console.log(variables)
        firebase.messaging().subscribeToTopic('allUsers');
    }
    navigate(val,data) {
        this.props.navigation.navigate(val,data)
    }
  render() {
    return (
      <View style={{ height:height}}>
        <HeaderHome navigate={this.navigate.bind(this)}/>

        <ListEvents navigate={this.navigate.bind(this)}/>
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
