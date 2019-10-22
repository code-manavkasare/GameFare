import React, {Component} from 'react';
import AppSwitchNavigator from './src/components/navigation/AppNavigator'

import { createAppContainer } from 'react-navigation';
import SplashScreen from 'react-native-splash-screen';
import branch, { BranchEvent } from 'react-native-branch'
import StatusBar from '@react-native-community/status-bar';
import firebase from 'react-native-firebase'
import {connect} from 'react-redux';
import {globaleVariablesAction} from './src/actions/globaleVariablesActions'
const AppContainer = createAppContainer(AppSwitchNavigator)

class App extends Component {
  state={items:[]}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  async componentDidMount() {
    await this.initBranch()
    var variables = await firebase.database().ref('variables').once('value')
    variables = variables.val()
    await this.props.globaleVariablesAction(variables)

    SplashScreen.hide()
    StatusBar.setHidden(false, "slide")
    StatusBar.setBarStyle('light-content',true)
    
  }
  initBranch() {
    var that = this

    branch.subscribe(({ error, params }) => {
      if (error) {
        console.log("Error from Branch: " + error)
        return
      }
      console.log('branch link opened !')
      console.log(params)
      if (params.action == 'openEventPage') {
        var straightToProduct = (params.straightToProduct == 'true')
        that.openProduct(params.eventID)
      } else if (params.type == 'share') {
        ls.save('giftShare', params.value)
      }
    })
  }
  render() {
    return <AppContainer />
  }
}

const  mapStateToProps = state => {
  return {
  };
};

export default connect(mapStateToProps,{globaleVariablesAction})(App);
