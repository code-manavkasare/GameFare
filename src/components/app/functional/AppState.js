import React, {Component} from 'react';
import {AppState} from 'react-native';

import {sentryAddBreadcrumb} from '../../functions/logs.js';

class AppStateComponent extends Component {
  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    sentryAddBreadcrumb('appState', nextAppState);
  };

  render() {
    return null;
  }
}

export default AppStateComponent;
