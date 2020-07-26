import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {ReduxNetworkProvider} from 'react-native-offline';
import {PersistGate} from 'redux-persist/lib/integration/react';

import {persistor, store} from './reduxStore';

// Need to import globally in react native
// for axios authenticated POST to work properly
import {decode, encode} from 'base-64';
if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}

console.disableYellowBox = true;

const AppContainer = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ReduxNetworkProvider>
        <App />
      </ReduxNetworkProvider>
    </PersistGate>
  </Provider>
);

AppRegistry.registerComponent(appName, () => AppContainer);
