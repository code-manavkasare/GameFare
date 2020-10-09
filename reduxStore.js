import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import {persistStore, persistReducer, createMigrate} from 'redux-persist';
import {
  reducer as network,
  createNetworkMiddleware,
  offlineActionCreators,
  checkInternetConnection,
} from 'react-native-offline';
import {composeWithDevTools} from 'remote-redux-devtools';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import AsyncStorage from '@react-native-community/async-storage';
import thunk from 'redux-thunk';

import rootReducer from './src/reducers';

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
    'events',
    'message',
    'createChallengeData',
    'coach',
    'layout',
    'globaleVariables',
    'uploadQueue',
    'network',
    'phoneContacts',
    'bindedArchives',
    'bindedConversations',
    'bindedSessions',
    'connectionType',
  ],
  migrate: createMigrate(migrations, {debug: true}),
  // stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
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
