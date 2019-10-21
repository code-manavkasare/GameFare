
import React from 'react'
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';


import { PersistGate } from 'redux-persist/lib/integration/react';
import { persistor, store } from './reduxStore';

console.disableYellowBox = true;

const AppContainer = () =>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
          <App />
      </PersistGate>
    </Provider>

AppRegistry.registerComponent(appName, () => AppContainer);
