import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

// import {getDatabase} from '../database/firebase'

import firebase from 'react-native-firebase'

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
    async click() {
        this.props.navigation.navigate('Loading',{message:'the message is here sdfsdfsd'})
    }
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => this.click()}>
            <Text style={{color:'white',fontSize:15}}>Click me</Text>
        </TouchableOpacity>
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
