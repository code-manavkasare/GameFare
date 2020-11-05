import {applyMiddleware, createStore} from 'redux';
import {persistStore, persistReducer, createMigrate} from 'redux-persist';
import {
  createNetworkMiddleware,
  offlineActionCreators,
  checkInternetConnection,
} from 'react-native-offline';
import {composeWithDevTools} from 'remote-redux-devtools';
import AsyncStorage from '@react-native-community/async-storage';
import thunk from 'redux-thunk';

import rootReducer from './reducers';

const networkMiddleware = createNetworkMiddleware();
const middlewares = [networkMiddleware, thunk];

if (__DEV__) {
  const createDebugger = require('redux-flipper').default;
  middlewares.push(createDebugger());
}

const migrations = {
  // 0: (state) => {
  //   return {
  //     ...state,
  //     appSettings: {...state.appSettings, recordingPermission: true},
  //   };
  // },
};

const persistConfig = {
  key: 'root',
  timeout: 10000,
  storage: AsyncStorage,
  version: 0,
  blacklist: [
    'message',
    'coach',
    'layout',
    'globaleVariables',
    'network',
    'phoneContacts',
    'bindedArchives',
    'bindedConversations',
    'bindedSessions',
    'connectionType',
  ],
  migrate: createMigrate(migrations, {debug: true}),
};

const pReducer = persistReducer(persistConfig, rootReducer);
const composeEnhancers = composeWithDevTools({realtime: true});

export const store = createStore(
  pReducer,
  composeEnhancers(applyMiddleware(...middlewares)),
);

const storeInitializationAfterRehydration = () => {
  // After rehydration completes, we detect initial connection
  checkInternetConnection().then((isConnected) => {
    const {connectionChange} = offlineActionCreators;
    store.dispatch(connectionChange(isConnected));
  });
};

export const persistor = persistStore(store, null, () => {
  storeInitializationAfterRehydration();
});
