import React, {Component} from 'react';
import AppSwitchNavigator from './src/components/navigation/AppNavigator'

import { createAppContainer } from 'react-navigation';
import SplashScreen from 'react-native-splash-screen';
import branch, { BranchEvent } from 'react-native-branch'
// import StatusBar from '@react-native-community/status-bar';

const AppContainer = createAppContainer(AppSwitchNavigator)

export default class App extends Component {
  state={items:[]}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  componentDidMount() {
    SplashScreen.hide()
    this.initBranch()
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
