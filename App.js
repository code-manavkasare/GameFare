import React, {Component} from 'react';
import AppNavigator from './components/navigation/AppNavigator'

import { createAppContainer } from 'react-navigation';
import {getDatabase,initFirebase} from './components/database/firebase'

import SplashScreen from 'react-native-splash-screen';

const AppContainer = createAppContainer(AppNavigator)

export default class App extends Component {
  state={items:[]}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  componentDidMount() {
    SplashScreen.hide()
  }
  render() {
    return <AppContainer />
  }
}
