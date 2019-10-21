import React from 'react';
import { 
    StyleSheet,
    View,
    TouchableHighlight,
    Text
} from 'react-native';

import { createAppContainer } from 'react-navigation';
import CreateEventNavigator from '../navigation/CreateEventNavigator'
import Header from '../layout/headers/HeaderButton'
const CreateEventContainer = createAppContainer(CreateEventNavigator)

export default class CreateEvent extends React.Component {
  state={check:false}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  render() {
    return (
      <CreateEventContainer/>
    )
  }
}

const styles = StyleSheet.create({
    button:{
        height:40,width:120,
        backgroundColor:'blue',
        alignItems: 'center',
    justifyContent: 'center',
    marginTop:10
    }
  });
